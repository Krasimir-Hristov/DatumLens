-- Migration 009: Add Missing RLS Policies
-- This migration adds missing DELETE and UPDATE policies for messages table

-- ============================================
-- MESSAGES TABLE - Add missing policies
-- ============================================

-- Drop existing policies if any (for clean re-run)
DROP POLICY IF EXISTS "Users can update own chat messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON messages;

-- Users can update messages in their own chats
CREATE POLICY "Users can update own chat messages" ON messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- Users can delete messages from their own chats
CREATE POLICY "Users can delete own chat messages" ON messages
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- You can verify these policies work by running:
-- SELECT * FROM pg_policies WHERE tablename = 'messages';
