import asyncio
from datetime import datetime, timezone

import bcrypt
from sqlalchemy import select

from app.database import async_session, engine
from app.models import Authorship, Base, Conference, PaperSubmission, Review, Track, User


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        pw = bcrypt.hashpw(b"Password123!", bcrypt.gensalt()).decode()

        admin = User(id="user_admin_001", first_name="Admin", last_name="AcademicConf",
                     email="admin@academicconf.io", password_hash=pw,
                     academic_affiliation="AcademicConf", country="Morocco",
                     biography="Platform administrator", role="ADMIN")
        chair = User(id="user_chair_001", first_name="Fatima", last_name="Benali",
                     email="fatima.benali@um5.ac.ma", password_hash=pw,
                     academic_affiliation="Université Mohammed V de Rabat",
                     country="Morocco", biography="Professor of Computer Science",
                     role="PC_CHAIR")
        reviewer = User(id="user_review_001", first_name="Youssef", last_name="El Mansouri",
                        email="y.elmansouri@uca.ac.ma", password_hash=pw,
                        academic_affiliation="Université Cadi Ayyad",
                        country="Morocco", biography="Associate Professor in ML",
                        role="REVIEWER")
        author = User(id="user_author_001", first_name="Amine", last_name="Tazi",
                      email="amine.tazi@student.ensa.ma", password_hash=pw,
                      academic_affiliation="ENSIAS Rabat", country="Morocco",
                      biography="PhD Student in AI", role="AUTHOR")

        db.add_all([admin, chair, reviewer, author])
        await db.flush()

        now = datetime.now(timezone.utc)

        confs = [
            Conference(id="conf_ai_001", name="IEEE International Conference on Artificial Intelligence 2026",
                       location="Marrakech, Morocco", status="OPEN",
                       start_date=datetime(2026, 9, 15), end_date=datetime(2026, 9, 18),
                       submission_deadline=datetime(2026, 6, 1), description="Premier AI conference in North Africa"),
            Conference(id="conf_se_001", name="ACM Symposium on Software Engineering 2026",
                       location="Rabat, Morocco", status="UPCOMING",
                       start_date=datetime(2026, 11, 10), end_date=datetime(2026, 11, 12),
                       submission_deadline=datetime(2026, 8, 15), description="Software engineering symposium"),
            Conference(id="conf_cs_001", name="International Workshop on Cybersecurity 2026",
                       location="Casablanca, Morocco", status="UPCOMING",
                       start_date=datetime(2026, 12, 5), end_date=datetime(2026, 12, 6),
                       submission_deadline=datetime(2026, 10, 1), description="Cybersecurity workshop"),
            Conference(id="conf_ml_001", name="Journal of Machine Learning Research - Special Issue",
                       location="Online", status="CLOSED",
                       start_date=datetime(2026, 1, 1), end_date=datetime(2026, 3, 31),
                       submission_deadline=datetime(2025, 12, 31), description="Special issue on deep learning"),
            Conference(id="conf_cc_001", name="IEEE Conference on Cloud Computing 2025",
                       location="Fez, Morocco", status="ARCHIVED",
                       start_date=datetime(2025, 5, 20), end_date=datetime(2025, 5, 22),
                       submission_deadline=datetime(2025, 3, 1), description="Cloud computing conference"),
        ]
        db.add_all(confs)
        await db.flush()

        tracks = [
            Track(id="track_ai_ml", name="Machine Learning", conference_id="conf_ai_001"),
            Track(id="track_ai_dl", name="Deep Learning & Neural Networks", conference_id="conf_ai_001"),
            Track(id="track_ai_nlp", name="Natural Language Processing", conference_id="conf_ai_001"),
            Track(id="track_se_req", name="Requirements Engineering", conference_id="conf_se_001"),
            Track(id="track_se_arch", name="Software Architecture", conference_id="conf_se_001"),
            Track(id="track_se_test", name="Testing & Quality Assurance", conference_id="conf_se_001"),
            Track(id="track_cs_net", name="Network Security", conference_id="conf_cs_001"),
            Track(id="track_cs_crypto", name="Cryptography", conference_id="conf_cs_001"),
            Track(id="track_ml_sup", name="Supervised Learning", conference_id="conf_ml_001"),
            Track(id="track_ml_unsup", name="Unsupervised Learning", conference_id="conf_ml_001"),
            Track(id="track_cc_infra", name="Cloud Infrastructure", conference_id="conf_cc_001"),
            Track(id="track_cc_server", name="Serverless Computing", conference_id="conf_cc_001"),
        ]
        db.add_all(tracks)
        await db.flush()

        papers = [
            PaperSubmission(id="paper_001", title="A Novel Approach to Federated Learning for Healthcare",
                            abstract="This paper presents a novel federated learning framework designed specifically for healthcare applications. "
                                     "We address key challenges including data heterogeneity, communication efficiency, and privacy preservation. "
                                     "Our approach achieves 95% accuracy while reducing communication overhead by 60% compared to traditional methods.",
                            status="UNDER_REVIEW", track_id="track_ai_ml"),
            PaperSubmission(id="paper_002", title="Transformer-Based Sentiment Analysis for Low-Resource Languages",
                            abstract="We propose a transformer-based architecture for sentiment analysis in low-resource languages. "
                                     "Our model leverages cross-lingual transfer learning and data augmentation techniques to achieve "
                                     "state-of-the-art results on 5 under-represented languages with limited annotated data.",
                            status="SUBMITTED", track_id="track_ai_nlp"),
            PaperSubmission(id="paper_003", title="Automated Code Review Using Large Language Models",
                            abstract="This research investigates the application of large language models for automated code review in "
                                     "software engineering. We evaluate multiple LLM architectures on a curated dataset of 10,000 code reviews "
                                     "and demonstrate that fine-tuned models can detect 85% of critical bugs before deployment.",
                            status="DRAFT", track_id="track_se_req"),
        ]
        db.add_all(papers)
        await db.flush()

        authorship_data = [
            (papers[0], author, 1, True),
            (papers[0], chair, 2, False),
            (papers[1], author, 1, True),
            (papers[1], reviewer, 2, False),
            (papers[2], author, 1, True),
        ]
        authorships = []
        for paper, user, order, is_corr in authorship_data:
            authorships.append(Authorship(
                paper_id=paper.id, user_id=user.id,
                author_sequence_order=order, is_corresponding_author=is_corr,
            ))
        db.add_all(authorships)
        await db.flush()

        db.add(Review(id="review_001", paper_id="paper_001", reviewer_id="user_review_001",
                      comments="Well-structured paper with clear methodology. The results are promising but need more ablation studies.",
                      evaluation_comments="Accept with minor revisions. The federated learning approach is novel.",
                      status="COMPLETED"))
        db.add(Review(id="review_002", paper_id="paper_001", reviewer_id="user_chair_001",
                      comments="",
                      evaluation_comments="",
                      status="PENDING"))

        await db.commit()

    print("Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
