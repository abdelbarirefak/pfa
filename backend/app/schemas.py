from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def _to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])


class CamelCaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class RegisterPayload(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    academic_affiliation: str
    country: str | None = None


class LoginResponse(BaseModel):
    token: str
    user: "UserResponse"


class UserResponse(CamelCaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    academic_affiliation: str
    country: str | None = None
    biography: str | None = None
    meta_link: str | None = None
    role: str


class ConferenceResponse(CamelCaseModel):
    id: str
    name: str
    location: str
    start_date: datetime
    end_date: datetime
    submission_deadline: datetime
    status: str
    description: str | None = None
    track_count: int | None = None


class TrackResponse(CamelCaseModel):
    id: str
    conference_id: str
    name: str


class AuthorshipResponse(CamelCaseModel):
    paper_id: str
    user_id: str
    author_sequence_order: int
    is_corresponding_author: bool
    user: UserResponse | None = None


class PaperSubmissionResponse(CamelCaseModel):
    id: str
    track_id: str
    conference_id: str
    title: str
    abstract: str
    manuscript_file_url: str | None = None
    status: str
    authorship_list: list[AuthorshipResponse] = []
    track_name: str | None = None
    conference_name: str | None = None
    created_at: str | None = None
    updated_at: str | None = None


class ReviewResponse(CamelCaseModel):
    id: str
    paper_id: str
    reviewer_id: str
    comments: str
    evaluation_comments: str
    status: str
    paper_title: str | None = None
    conference_name: str | None = None


class CreateSubmissionPayload(CamelCaseModel):
    track_id: str
    conference_id: str
    title: str
    abstract: str

    @field_validator("title")
    @classmethod
    def title_min_length(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Title must be at least 10 characters")
        return v.strip()

    @field_validator("abstract")
    @classmethod
    def abstract_min_length(cls, v: str) -> str:
        if len(v.strip()) < 100:
            raise ValueError("Abstract must be at least 100 characters")
        return v.strip()


class UpdateSubmissionPayload(CamelCaseModel):
    title: str | None = None
    abstract: str | None = None
    status: str | None = None


class UpdateAuthorshipPayload(CamelCaseModel):
    authorships: list["AuthorshipInput"]


class AuthorshipInput(CamelCaseModel):
    user_id: str
    author_sequence_order: int
    is_corresponding_author: bool


class UpdateReviewPayload(CamelCaseModel):
    comments: str | None = None
    evaluation_comments: str | None = None
    status: str | None = None


class AssignReviewPayload(CamelCaseModel):
    paper_id: str
    reviewer_id: str


class CreateConferencePayload(CamelCaseModel):
    name: str
    location: str
    start_date: datetime
    end_date: datetime
    submission_deadline: datetime
    description: str | None = None
    status: str | None = None


class CreateTrackPayload(CamelCaseModel):
    name: str


class UpdateProfilePayload(CamelCaseModel):
    first_name: str | None = None
    last_name: str | None = None
    academic_affiliation: str | None = None
    country: str | None = None
    biography: str | None = None
    meta_link: str | None = None


class ErrorResponse(BaseModel):
    message: str
    status: int
