from django.urls import path
from .views import UpvoteFeedbackView, TrendingFeedbackView, DownvoteFeedbackView,ToggleUpvoteView

urlpatterns = [
    path('feedback/upvote/<int:feedback_id>/', ToggleUpvoteView.as_view(), name='upvote-feedback'),
    path('feedback/trending/', TrendingFeedbackView.as_view(), name='trending-feedback'),
    path('feedback/<int:feedback_id>/downvote/', DownvoteFeedbackView.as_view(), name='downvote-feedback'),
]
