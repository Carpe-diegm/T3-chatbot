-- 1. Enable RLS on core tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- 2. Secure the "User" table
-- Only allow users to see and update their own record
CREATE POLICY user_ownership_policy ON "User"
    FOR ALL
    USING (id = current_setting('app.current_user_id', true))
    WITH CHECK (id = current_setting('app.current_user_id', true));

-- 3. Secure the "Chat" table
-- Only allow users to see, insert, or delete their own chats
CREATE POLICY chat_ownership_policy ON "Chat"
    FOR ALL
    USING ("userId" = current_setting('app.current_user_id', true))
    WITH CHECK ("userId" = current_setting('app.current_user_id', true));

-- 4. Secure the "Message" table (via Chat ownership)
-- A user can only see/edit messages that belong to a chat they own
CREATE POLICY message_ownership_policy ON "Message"
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM "Chat" 
            WHERE id = "Message"."chatId" 
            AND "userId" = current_setting('app.current_user_id', true)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Chat" 
            WHERE id = "Message"."chatId" 
            AND "userId" = current_setting('app.current_user_id', true)
        )
    );

-- 5. Helper for development (Allow full access to specific roles if needed)
-- Granting bypass to the superuser (already default in most cases)
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Chat" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Message" FORCE ROW LEVEL SECURITY;
