import { cn } from '../lib/utils';
import { usePOSStore } from '../store/pos-store';
import CommentDialog from './CommentDialog';
import { useState } from 'react';
import { AppSidebar } from './ui/app-sidebar';

interface SidebarProps {
  disabled?: boolean;
}

const Sidebar = ({ disabled }: SidebarProps) => {
  const { orderComment, setOrderComment } = usePOSStore();
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  const handleCommentSave = (comment: string) => {
    setOrderComment(comment);
  };

  return (
    <div className={cn(
      "w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col",
      disabled && "opacity-50 pointer-events-none"
    )}>
      <AppSidebar />

      {/* Comment Dialog is rendered from sidebar but triggered from order panel, to not mount it on every order panel render */}
      <CommentDialog
        isOpen={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSave={handleCommentSave}
        initialComment={orderComment}
      />
    </div>
  );
};

export default Sidebar;