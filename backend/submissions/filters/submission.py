import django_filters

from submissions import models


class SubmissionFilterSet(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")
    brokerId = django_filters.NumberFilter(field_name="broker")
    companySearch = django_filters.CharFilter(field_name="company__legal_name", lookup_expr="icontains")
    createdFrom = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    createdTo = django_filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")
    hasDocuments = django_filters.BooleanFilter(method="filter_has_documents")
    hasNotes = django_filters.BooleanFilter(method="filter_has_notes")

    def filter_has_documents(self, queryset, name, value):
        return queryset.filter(document_count__gt=0) if value else queryset.filter(document_count=0)

    def filter_has_notes(self, queryset, name, value):
        return queryset.filter(note_count__gt=0) if value else queryset.filter(note_count=0)

    class Meta:
        model = models.Submission
        fields = []
