import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { draynorApi } from "../api/draynor";
import "./Comments.css";

interface CommentItem {
  id: number;
  manga_id: number;
  user_id: string;
  comment: string;
  path: string;
  created_at: string;
  total_replies: number;
}

interface CommentsProps {
  manga_id: number;
}

const Comments = ({ manga_id }: CommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    loadComments();
  }, [manga_id]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await draynorApi.comments.getRoots(manga_id);
      setComments(data.results);
    } finally {
      setLoading(false);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;
    await draynorApi.comments.create(manga_id, newComment);
    setNewComment("");
    loadComments();
  };

  const sendReply = async (parentId: number) => {
    if (!replyText.trim()) return;
    await draynorApi.comments.reply(manga_id, replyText, parentId);
    setReplyText("");
    setReplyTo(null);
    loadComments();
  };

  const renderTree = (root: CommentItem) => {
    const children = comments

    return (
      <div key={root.id} className="comment-thread">
        <div className="comment-item">
          <div className="comment-header">
            <span className="comment-author">User {root.user_id.slice(0, 6)}</span>
            <span className="comment-date">
              {new Date(root.created_at).toLocaleDateString()}
            </span>
          </div>

          <p className="comment-text">{root.comment}</p>

          <button
            className="comment-reply-btn"
            onClick={() => setReplyTo(replyTo === root.id ? null : root.id)}
          >
            Reply ({root.total_replies})
          </button>

          {replyTo === root.id && (
            <div className="reply-box">
              <textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button onClick={() => sendReply(root.id)} className="reply-submit">
                Send
              </button>
            </div>
          )}
        </div>

        {children.length > 0 && (
          <div className="comment-children">
            {children.map((child) => renderTree(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comments-section">

      <h2 className="comments-title">Comments</h2>

      {user && (
        <div className="new-comment-box">
          <textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={sendComment} className="comment-submit">
            Send
          </button>
        </div>
      )}

      {loading ? (
        <div className="comments-loading">Loading...</div>
      ) : (
        <div className="comments-list">
          { comments.map(root => renderTree(root)) }
        </div>
      )}

    </div>
  );
};

export default Comments;
