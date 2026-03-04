"""
Evaluation API — RAGAS-powered RAG quality assessment.

POST /eval/run         → Run evaluation with sample dataset
POST /eval/run-custom  → Run evaluation with custom Q&A pairs
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.services.eval_service import run_evaluation, EvalSample
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/eval", tags=["Evaluation"])


class CustomEvalSample(BaseModel):
    question: str
    ground_truth: str


@router.post("/run")
async def run_rag_evaluation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Runs RAGAS evaluation on the user's RAG pipeline using a sample dataset.
    
    Evaluates your retrieval + generation quality across 4 metrics:
    - **Context Precision**: Are retrieved chunks relevant to the question?
    - **Context Recall**: Did we retrieve ALL relevant information?
    - **Faithfulness**: Is the answer grounded in context (no hallucination)?
    - **Answer Relevance**: Does the answer actually address the question?
    
    Requires: At least some documents uploaded for meaningful results.
    """
    result = await run_evaluation(db, str(current_user.id))

    return {
        "scores": {
            "context_precision": round(result.context_precision, 4),
            "context_recall": round(result.context_recall, 4),
            "faithfulness": round(result.faithfulness, 4),
            "answer_relevancy": round(result.answer_relevancy, 4),
        },
        "overall_score": round(
            (result.context_precision + result.context_recall + 
             result.faithfulness + result.answer_relevancy) / 4, 4
        ),
        "num_samples": result.num_samples,
        "timestamp": result.timestamp,
        "details": result.details,
        "interpretation": {
            "context_precision": "How relevant are the retrieved chunks to the question",
            "context_recall": "Did we find ALL relevant information from the documents",
            "faithfulness": "Is the answer grounded in context (no hallucination)",
            "answer_relevancy": "Does the answer actually address the question asked",
        },
        "scoring_guide": {
            "excellent": "> 0.85",
            "good": "0.70 - 0.85",
            "needs_improvement": "0.50 - 0.70",
            "poor": "< 0.50"
        }
    }


@router.post("/run-custom")
async def run_custom_evaluation(
    samples: List[CustomEvalSample],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Run evaluation with YOUR custom question-answer pairs.
    
    Send a list of questions with expected answers (ground truths).
    The system will retrieve context, generate answers, and score quality.
    
    Example body:
    ```json
    [
        {"question": "What is X?", "ground_truth": "X is..."},
        {"question": "Who is Y?", "ground_truth": "Y is..."}
    ]
    ```
    """
    eval_samples = [
        EvalSample(question=s.question, ground_truth=s.ground_truth)
        for s in samples
    ]

    result = await run_evaluation(db, str(current_user.id), eval_samples)

    return {
        "scores": {
            "context_precision": round(result.context_precision, 4),
            "context_recall": round(result.context_recall, 4),
            "faithfulness": round(result.faithfulness, 4),
            "answer_relevancy": round(result.answer_relevancy, 4),
        },
        "overall_score": round(
            (result.context_precision + result.context_recall + 
             result.faithfulness + result.answer_relevancy) / 4, 4
        ),
        "num_samples": result.num_samples,
        "timestamp": result.timestamp,
        "details": result.details,
    }
