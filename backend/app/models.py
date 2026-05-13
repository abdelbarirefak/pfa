import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def _uuid():
    return uuid.uuid4().hex


def _utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    academic_affiliation: Mapped[str] = mapped_column(String(200))
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    biography: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="AUTHOR")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    authorships: Mapped[list["Authorship"]] = relationship(back_populates="user")
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="reviewer", foreign_keys="Review.reviewer_id"
    )


class Conference(Base):
    __tablename__ = "conferences"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(300))
    location: Mapped[str] = mapped_column(String(300))
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    submission_deadline: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="UPCOMING")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    tracks: Mapped[list["Track"]] = relationship(back_populates="conference")


class Track(Base):
    __tablename__ = "tracks"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200))
    conference_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("conferences.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    conference: Mapped["Conference"] = relationship(back_populates="tracks")
    submissions: Mapped[list["PaperSubmission"]] = relationship(back_populates="track")


class PaperSubmission(Base):
    __tablename__ = "paper_submissions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String(500))
    abstract: Mapped[str] = mapped_column(Text)
    manuscript_file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="DRAFT")
    track_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tracks.id")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    track: Mapped["Track"] = relationship(back_populates="submissions")
    authorships: Mapped[list["Authorship"]] = relationship(back_populates="paper")
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="paper", foreign_keys="Review.paper_id"
    )


class Authorship(Base):
    __tablename__ = "authorships"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    paper_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("paper_submissions.id", ondelete="CASCADE")
    )
    user_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    author_sequence_order: Mapped[int] = mapped_column(Integer, default=1)
    is_corresponding_author: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)

    __table_args__ = (
        UniqueConstraint("paper_id", "user_id", name="uq_authorship_paper_user"),
    )

    paper: Mapped["PaperSubmission"] = relationship(back_populates="authorships")
    user: Mapped["User"] = relationship(back_populates="authorships")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=_uuid)
    paper_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("paper_submissions.id", ondelete="CASCADE")
    )
    reviewer_id: Mapped[str] = mapped_column(String(32), ForeignKey("users.id"))
    comments: Mapped[str] = mapped_column(Text, default="")
    evaluation_comments: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=_utcnow, onupdate=_utcnow)

    __table_args__ = (
        UniqueConstraint("paper_id", "reviewer_id", name="uq_review_paper_reviewer"),
    )

    paper: Mapped["PaperSubmission"] = relationship(
        back_populates="reviews", foreign_keys=[paper_id]
    )
    reviewer: Mapped["User"] = relationship(
        back_populates="reviews", foreign_keys=[reviewer_id]
    )
