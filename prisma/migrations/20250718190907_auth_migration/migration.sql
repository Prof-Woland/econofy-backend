-- CreateTable
CREATE TABLE "Avatar" (
    "user_login" TEXT NOT NULL,
    "avatarPath" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Avatar_pkey" PRIMARY KEY ("user_login")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_user_login_key" ON "Avatar"("user_login");

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_user_login_fkey" FOREIGN KEY ("user_login") REFERENCES "users"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
