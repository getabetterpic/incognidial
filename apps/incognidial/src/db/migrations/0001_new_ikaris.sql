CREATE UNIQUE INDEX "users_phone_number_email_index" ON "users" USING btree ("phone_number","email");