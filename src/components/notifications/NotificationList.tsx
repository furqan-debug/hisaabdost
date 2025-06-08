
import { formatDistanceToNow } from 'date-fns';
import { X, Check, Trash2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationListProps {
  onClose: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '🚨';
      case 'success':
        return '✅';
      case 'info':
      default:
        return '💡';
    }
  };

  console.log('NotificationList render - notifications:', notifications, 'unreadCount:', unreadCount);

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} new</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 px-3 text-xs font-medium hover:bg-muted/50"
            >
              <Check className="h-3 w-3 mr-1.5" />
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="h-96 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mx-auto mb-4">
                <Bell className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="text-base font-medium text-foreground mb-2">No notifications</h4>
              <p className="text-sm text-muted-foreground">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative p-4 rounded-lg transition-all duration-200 hover:bg-muted/30 mb-2',
                    !notification.read && 'bg-primary/5 border border-primary/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-sm',
                        notification.type === 'success' && 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                        notification.type === 'warning' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                        notification.type === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                        notification.type === 'info' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn(
                          'text-sm font-medium leading-5',
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-7 w-7 p-0 hover:bg-background"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNotification(notification.id)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-background"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2 pr-4">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="absolute left-2 top-4 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator className="opacity-50" />
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full h-9 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              Clear all notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
