import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    """Basic filter set for the submissions list endpoint.

    Only the status filter is implemented so the candidate can extend the
    remaining filters (broker, company search, optional extras, etc.).
    """

    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker")
    companySearch = django_filters.CharFilter(field_name="company__legal_name", lookup_expr="icontains")

    class Meta:
        model = models.Submission
        fields = ["status", "brokerId", "companySearch"]

