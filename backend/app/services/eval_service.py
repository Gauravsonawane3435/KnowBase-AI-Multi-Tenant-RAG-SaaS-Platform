"""
RAG Evaluation Service using RAGAS Framework.

Measures retrieval and generation quality using four key metrics:
- Context Precision: Are retrieved chunks relevant?
- Context Recall: Did we retrieve all relevant info?
- Faithfulness: Is the answer grounded in context (no hallucination)?
- Answer Relevance: Does the answer address the question?
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.rag_service import retrieve_relevant_chunks
from app.services.llm_service import generate_rag_response


@dataclass
class EvalSample:
    """A single evaluation sample with ground truth."""
    question: str
    ground_truth: str


@dataclass
class EvalResult:
    """Evaluation scores for a single run."""
    context_precision: float
    context_recall: float
    faithfulness: float
    answer_relevancy: float
    num_samples: int
    timestamp: str
    details: list = field(default_factory=list)


# ────────────────────────────────────────────────────────
#  Sample Evaluation Dataset
#  Replace with domain-specific Q&A pairs for your use case
# ────────────────────────────────────────────────────────

SAMPLE_EVAL_DATASET = [
    EvalSample(
        question="What is the company's total revenue?",
        ground_truth="The company's total revenue for the fiscal year was $4.2 billion, representing a 15% increase year-over-year."
    ),
    EvalSample(
        question="What are the main risk factors?",
        ground_truth="The main risk factors include market volatility, regulatory changes, cybersecurity threats, and supply chain disruptions."
    ),
    EvalSample(
        question="Who is the CEO of the company?",
        ground_truth="The CEO is John Smith, who has been leading the company since 2019."
    ),
    EvalSample(
        question="What is the employee count?",
        ground_truth="The company employs approximately 12,500 people across 30 countries."
    ),
    EvalSample(
        question="What is the company's sustainability strategy?",
        ground_truth="The company aims to achieve carbon neutrality by 2030 through renewable energy adoption, waste reduction, and sustainable supply chain practices."
    ),
]


async def run_evaluation(
    db: AsyncSession,
    user_id: str,
    eval_samples: Optional[list[EvalSample]] = None,
) -> EvalResult:
    """
    Runs the full RAGAS evaluation pipeline:
    1. For each question, retrieve context from user's documents
    2. Generate LLM answer
    3. Compare against ground truth using RAGAS metrics
    
    Falls back to a simulated evaluation if the RAGAS library is not installed
    or if there's an API error (rate limiting, etc.)
    """
    samples = eval_samples or SAMPLE_EVAL_DATASET

    questions = []
    ground_truths = []
    contexts_list = []
    answers = []

    print(f"DEBUG: Running evaluation with {len(samples)} samples for user {user_id}")

    for i, sample in enumerate(samples):
        print(f"DEBUG: Evaluating sample {i+1}/{len(samples)}: '{sample.question[:50]}...'")
        
        # 1. Retrieve context
        context_str = await retrieve_relevant_chunks(db, user_id, sample.question)
        contexts = [context_str] if context_str else ["No context found in uploaded documents."]

        # 2. Generate answer
        if context_str:
            try:
                answer = await generate_rag_response(sample.question, context_str)
            except Exception as e:
                print(f"WARN: LLM generation failed for sample {i+1}: {e}")
                answer = "Error generating response."
        else:
            answer = "No relevant context found in uploaded documents."

        questions.append(sample.question)
        ground_truths.append(sample.ground_truth)
        contexts_list.append(contexts)
        answers.append(answer)

    # 3. Try RAGAS evaluation
    try:
        result = await _run_ragas_evaluation(questions, answers, contexts_list, ground_truths)
    except Exception as e:
        print(f"WARN: RAGAS evaluation failed ({e}), using heuristic evaluation")
        result = _run_heuristic_evaluation(questions, answers, contexts_list, ground_truths)

    # 4. Build details
    details = []
    for i, sample in enumerate(samples):
        details.append({
            "question": sample.question,
            "ground_truth": sample.ground_truth[:200],
            "generated_answer": answers[i][:200] + ("..." if len(answers[i]) > 200 else ""),
            "context_available": bool(contexts_list[i][0] and contexts_list[i][0] != "No context found in uploaded documents."),
        })

    return EvalResult(
        context_precision=result["context_precision"],
        context_recall=result["context_recall"],
        faithfulness=result["faithfulness"],
        answer_relevancy=result["answer_relevancy"],
        num_samples=len(samples),
        timestamp=datetime.utcnow().isoformat(),
        details=details,
    )


async def _run_ragas_evaluation(
    questions: list[str],
    answers: list[str],
    contexts: list[list[str]],
    ground_truths: list[str],
) -> dict:
    """Runs actual RAGAS evaluation using the ragas library."""
    from ragas import evaluate
    from ragas.metrics import (
        context_precision,
        context_recall,
        faithfulness,
        answer_relevancy,
    )
    from datasets import Dataset
    from langchain_google_genai import ChatGoogleGenerativeAI
    from app.config import settings

    eval_dataset = Dataset.from_dict({
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    })

    eval_llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GEMINI_API_KEY
    )

    result = evaluate(
        dataset=eval_dataset,
        metrics=[context_precision, context_recall, faithfulness, answer_relevancy],
        llm=eval_llm,
    )

    return {
        "context_precision": float(result["context_precision"]),
        "context_recall": float(result["context_recall"]),
        "faithfulness": float(result["faithfulness"]),
        "answer_relevancy": float(result["answer_relevancy"]),
    }


def _run_heuristic_evaluation(
    questions: list[str],
    answers: list[str],
    contexts: list[list[str]],
    ground_truths: list[str],
) -> dict:
    """
    Fallback heuristic evaluation when RAGAS library is not installed.
    Uses simple text overlap metrics as approximations.
    """
    precision_scores = []
    recall_scores = []
    faithfulness_scores = []
    relevancy_scores = []

    for i in range(len(questions)):
        question_words = set(questions[i].lower().split())
        answer_words = set(answers[i].lower().split())
        context_words = set(contexts[i][0].lower().split()) if contexts[i] else set()
        truth_words = set(ground_truths[i].lower().split())

        # Context Precision: How much of the context relates to the question?
        if context_words:
            precision = len(question_words & context_words) / max(len(question_words), 1)
            precision_scores.append(min(precision * 3, 1.0))  # Scale up
        else:
            precision_scores.append(0.0)

        # Context Recall: How much of the ground truth is in the context?
        if context_words and truth_words:
            recall = len(truth_words & context_words) / max(len(truth_words), 1)
            recall_scores.append(min(recall * 2, 1.0))
        else:
            recall_scores.append(0.0)

        # Faithfulness: How much of the answer comes from context (not hallucinated)?
        if context_words and answer_words:
            faith = len(answer_words & context_words) / max(len(answer_words), 1)
            faithfulness_scores.append(min(faith * 2.5, 1.0))
        else:
            faithfulness_scores.append(0.0)

        # Answer Relevancy: Does the answer address the question?
        if answer_words and question_words:
            relevancy = len(question_words & answer_words) / max(len(question_words), 1)
            relevancy_scores.append(min(relevancy * 3, 1.0))
        else:
            relevancy_scores.append(0.0)

    return {
        "context_precision": sum(precision_scores) / max(len(precision_scores), 1),
        "context_recall": sum(recall_scores) / max(len(recall_scores), 1),
        "faithfulness": sum(faithfulness_scores) / max(len(faithfulness_scores), 1),
        "answer_relevancy": sum(relevancy_scores) / max(len(relevancy_scores), 1),
    }
