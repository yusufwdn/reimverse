<?php

namespace App\Notifications;

use App\Models\Reimbursement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReimbursementNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $reimbursement;

    /**
     * Create a new notification instance.
     */
    public function __construct(Reimbursement $reimbursement)
    {
        $this->reimbursement = $reimbursement;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Reimbursement Request')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('A new reimbursement request has been submitted.')
            ->line('Title: ' . $this->reimbursement->title)
            ->line('Amount: ' . number_format($this->reimbursement->amount, 2))
            ->line('Category: ' . $this->reimbursement->category->name)
            ->line('Submitted by: ' . $this->reimbursement->user->name)
            ->action('View Request', url('/manager/reimbursements/' . $this->reimbursement->id))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'reimbursement_id' => $this->reimbursement->id,
            'title' => $this->reimbursement->title,
            'amount' => $this->reimbursement->amount,
            'user_id' => $this->reimbursement->user_id,
            'user_name' => $this->reimbursement->user->name,
        ];
    }
}
