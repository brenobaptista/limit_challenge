import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from submissions import models


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def broker(db):
    return models.Broker.objects.create(name="Test Broker", primary_contact_email="broker@example.com")


@pytest.fixture
def company(db):
    return models.Company.objects.create(legal_name="Acme Corp", industry="Tech", headquarters_city="NY")


@pytest.fixture
def owner(db):
    return models.TeamMember.objects.create(full_name="Test Owner", email="owner@example.com")


@pytest.fixture
def make_submission(broker, company, owner):
    def _make(status=models.Submission.Status.NEW, **kwargs):
        return models.Submission.objects.create(
            broker=broker, company=company, owner=owner, status=status, **kwargs
        )
    return _make


# --- Filter tests ---

@pytest.mark.django_db
def test_status_filter_returns_only_matching(client, make_submission):
    make_submission(status=models.Submission.Status.NEW)
    make_submission(status=models.Submission.Status.NEW)
    make_submission(status=models.Submission.Status.LOST)

    response = client.get(reverse("submission-list"), {"status": "new"})

    assert response.status_code == 200
    assert response.data["count"] == 2
    assert all(r["status"] == "new" for r in response.data["results"])


@pytest.mark.django_db
def test_broker_filter_returns_only_matching(client, company, owner):
    broker_a = models.Broker.objects.create(name="Broker A", primary_contact_email="")
    broker_b = models.Broker.objects.create(name="Broker B", primary_contact_email="")
    models.Submission.objects.create(broker=broker_a, company=company, owner=owner)
    models.Submission.objects.create(broker=broker_a, company=company, owner=owner)
    models.Submission.objects.create(broker=broker_b, company=company, owner=owner)

    response = client.get(reverse("submission-list"), {"brokerId": broker_a.id})

    assert response.status_code == 200
    assert response.data["count"] == 2
    assert all(r["broker"]["name"] == "Broker A" for r in response.data["results"])


@pytest.mark.django_db
def test_company_search_filter_is_case_insensitive(client, broker, owner):
    company_a = models.Company.objects.create(legal_name="Acme Corp")
    company_b = models.Company.objects.create(legal_name="Globex Inc")
    models.Submission.objects.create(broker=broker, company=company_a, owner=owner)
    models.Submission.objects.create(broker=broker, company=company_b, owner=owner)

    response = client.get(reverse("submission-list"), {"companySearch": "acme"})

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["company"]["legal_name"] == "Acme Corp"


# --- N+1 regression ---

@pytest.mark.django_db
def test_submission_list_queries_do_not_scale_with_results(client, make_submission, django_assert_num_queries):
    for _ in range(10):
        make_submission()

    with django_assert_num_queries(2):
        response = client.get(reverse("submission-list"))

    assert response.status_code == 200
