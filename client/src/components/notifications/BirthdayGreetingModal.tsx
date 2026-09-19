import React, { useState } from 'react';
import { Cake, Mail, Send, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { NotificationItem } from '../../types/index.js';
import { useNotifications } from '../../context/NotificationContext.js';

interface BirthdayGreetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: NotificationItem | null;
}

export const BirthdayGreetingModal: React.FC<BirthdayGreetingModalProps> = ({
  isOpen,
  onClose,
  notification,
}) => {
  const { sendBirthdayGreeting } = useNotifications();
  const [selectedTemplate, setSelectedTemplate] = useState<'warm' | 'milestone' | 'executive'>('warm');
  const [customNote, setCustomNote] = useState('');
  const [channel, setChannel] = useState<'both' | 'email' | 'sms'>('both');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!notification) return null;

  const clientName = notification.clientName || 'Valued Client';
  const age = notification.metadata?.ageTurning || 40;
  const birthdayDate = notification.metadata?.formattedBirthday || 'Upcoming';
  const idNumber = notification.metadata?.idNumber || 'RSA Verified';

  const templates = {
    warm: `Dear ${clientName},\n\nOn behalf of Johan van der Merwe and the entire advisory team at Royal Square Financial (Pty) Ltd, we wish you a joyous and fulfilling ${age}th birthday on ${birthdayDate}!\n\nMay this year bring sound health, happiness, and continued compounding prosperity. We are honored to manage your wealth journey.`,
    milestone: `Dear ${clientName},\n\nCongratulations on reaching your ${age}th milestone birthday!\n\nAs you celebrate this pivotal personal milestone on ${birthdayDate}, the team at Royal Square Financial wishes you extraordinary success. Your disciplined long-term financial planning is a testament to your legacy. Let us schedule your annual portfolio milestone review at your earliest convenience.`,
    executive: `Dear ${clientName},\n\nWarmest birthday regards on your ${age}th birthday from Royal Square Financial.\n\nThank you for your ongoing partnership with our Private Wealth Practice. Wishing you an outstanding year of executive achievement, well-being, and financial growth.`,
  };

  const currentMessage = customNote || templates[selectedTemplate];

  const handleSend = async () => {
    if (!notification.clientId) return;
    setSending(true);
    try {
      const success = await sendBirthdayGreeting(
        notification.clientId,
        clientName,
        currentMessage
      );
      if (success) {
        setSentSuccess(true);
        setTimeout(() => {
          setSentSuccess(false);
          setCustomNote('');
          onClose();
        }, 1800);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Client Birthday Wishes & Wealth Greeting"
      maxWidth="lg"
    >
      {sentSuccess ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-[#111111]">Birthday Greeting Dispatched!</h4>
          <p className="text-sm text-[#6B6B6B] max-w-md mx-auto">
            Official Royal Square Financial birthday card and advisory note delivered to{' '}
            <span className="font-semibold text-[#111111]">{clientName}</span> via{' '}
            {channel === 'both' ? 'Email & SMS' : channel.toUpperCase()}.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Client Header Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-50/80 to-amber-50/80 border border-red-200/80 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C62828] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Cake className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#111111] text-base">{clientName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-[#C62828] font-semibold">
                  Turns {age} on {birthdayDate}
                </span>
                {notification.metadata?.daysRemaining !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-medium">
                    {notification.metadata.daysRemaining === 0
                      ? 'Today! 🎉'
                      : `In ${notification.metadata.daysRemaining} days`}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1 font-mono">
                RSA ID Number: <span className="font-semibold text-[#111111]">{idNumber}</span> • Verified Home Affairs Registry
              </p>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Select Advisory Greeting Tone
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('warm');
                  setCustomNote('');
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'warm' && !customNote
                    ? 'border-[#C62828] bg-red-50/50 ring-1 ring-[#C62828]'
                    : 'border-[#D9D9D9] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C62828]" />
                  Warm & Celebratory
                </div>
                <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
                  Personal, health & wealth wishing template
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('milestone');
                  setCustomNote('');
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'milestone' && !customNote
                    ? 'border-[#C62828] bg-red-50/50 ring-1 ring-[#C62828]'
                    : 'border-[#D9D9D9] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                  <Cake className="w-3.5 h-3.5 text-amber-600" />
                  Milestone Review
                </div>
                <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
                  Highlights decade milestones & review invite
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate('executive');
                  setCustomNote('');
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'executive' && !customNote
                    ? 'border-[#C62828] bg-red-50/50 ring-1 ring-[#C62828]'
                    : 'border-[#D9D9D9] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#111111]">
                  <Mail className="w-3.5 h-3.5 text-[#111111]" />
                  Private Wealth
                </div>
                <p className="text-[11px] text-[#6B6B6B] mt-1 leading-snug">
                  Concise, formal executive partnership note
                </p>
              </button>
            </div>
          </div>

          {/* Message Preview & Custom Edit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Message Content Preview
              </label>
              <span className="text-[11px] text-[#6B6B6B]">You may edit directly before sending</span>
            </div>
            <textarea
              rows={5}
              value={currentMessage}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full text-xs font-normal p-3 rounded-lg border border-[#D9D9D9] focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent bg-white leading-relaxed text-[#111111]"
              placeholder="Type a personalized birthday message..."
            />
          </div>

          {/* Delivery Channels */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA] border border-[#E5E5E5]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#111111]">
              <span className="text-[#6B6B6B]">Dispatch Via:</span>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-[#D9D9D9]">
                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    channel === 'both' ? 'bg-[#1F1F1F] text-white' : 'text-[#6B6B6B] hover:text-[#111111]'
                  }`}
                >
                  Email + SMS
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    channel === 'email' ? 'bg-[#1F1F1F] text-white' : 'text-[#6B6B6B] hover:text-[#111111]'
                  }`}
                >
                  Email Only
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    channel === 'sms' ? 'bg-[#1F1F1F] text-white' : 'text-[#6B6B6B] hover:text-[#111111]'
                  }`}
                >
                  SMS Only
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={sending}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-1.5 bg-[#C62828] hover:bg-[#8E1B1B]"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Dispatching...' : 'Send Greeting Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
