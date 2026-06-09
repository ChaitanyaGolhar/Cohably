import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFlatStore } from '../store/flatStore';
import { useExpenseDetail } from '../hooks/useExpenseDetail';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { Button } from '../components/ui/Button';
import { formatTimeAgo, formatCurrency } from '../lib/utils';
import { Textarea } from '../components/ui/Textarea';
import type { Comment as ApiComment } from '../types/api';

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const currentFlat = useFlatStore((s) => s.currentFlat);
  
  const [commentText, setCommentText] = useState('');

  const {
    expense,
    isExpenseLoading,
    comments,
    isCommentsLoading,
    addComment,
    isAddingComment,
    toggleDispute,
    isTogglingDispute
  } = useExpenseDetail(currentFlat?.id || '', id || '');

  if (isExpenseLoading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading expense...</div>;
  }

  if (!expense || !currentFlat) {
    return <div className="p-8 text-center text-gray-500">Expense not found</div>;
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(commentText);
      setCommentText('');
    } catch (e) {}
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Expense Details</h1>
        <div className="w-10" />
      </div>

      {expense.isDisputed && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold">This expense is under dispute</h4>
            <p className="text-sm mt-1">Review the comments below and resolve the issue before settling.</p>
          </div>
        </div>
      )}

      <Card padding="lg" className={expense.isDisputed ? 'border-red-200' : ''}>
        <div className="flex items-center justify-between mb-6">
          <CategoryBadge category={expense.category} />
          <span className="text-sm text-gray-500 font-medium">{formatTimeAgo(expense.createdAt)}</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{expense.title}</h2>
        
        <div className="flex items-center gap-3 mb-8">
          <Avatar src={expense.payer?.avatarUrl} name={expense.payer?.name} />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {expense.payer?.id === user?.id ? 'You' : expense.payer?.name} paid
            </p>
            <AmountDisplay amount={expense.amount} currency={currentFlat.currency} size="xl" className="mt-1" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Split Breakdown</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            {expense.splits?.map(split => (
              <div key={split.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={split.user?.avatarUrl} name={split.user?.name} size="sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {split.userId === user?.id ? 'You owe' : `${split.user?.name} owes`}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(split.amountOwed, currentFlat.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {expense.note && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Note</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{expense.note}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
          <Button 
            variant={expense.isDisputed ? 'secondary' : 'danger'} 
            className="flex-1"
            onClick={() => toggleDispute()}
            isLoading={isTogglingDispute}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {expense.isDisputed ? 'Resolve Dispute' : 'Dispute Expense'}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          Comments
        </h3>

        {isCommentsLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment: ApiComment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar src={comment.user?.avatarUrl} name={comment.user?.name} size="sm" />
                <div className="flex-1 bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{comment.user?.name}</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddComment} className="flex gap-2 items-end pt-2">
          <div className="flex-1">
            <Textarea 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[44px] h-[44px] py-3"
            />
          </div>
          <Button type="submit" isLoading={isAddingComment} disabled={!commentText.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
