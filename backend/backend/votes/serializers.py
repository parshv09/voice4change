from rest_framework import serializers
from votes.models import Upvote, Downvote

class UpvoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upvote
        fields = '__all__'
        
class DownvoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Downvote
        fields = '__all__'

# serializers.py
from rest_framework import serializers
from .models import Feedback
from .models import Upvote  # adjust path if needed

class FeedbackSerializer(serializers.ModelSerializer):
    user_upvoted = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = '__all__'  # or list + 'user_upvoted'
        read_only_fields = ['id', 'created_at', 'updated_at', 'keywords']

    def get_user_upvoted(self, obj):
        request = self.context.get("request", None)
        if request and request.user and request.user.is_authenticated:
            return Upvote.objects.filter(user=request.user, feedback=obj).exists()
        return False
