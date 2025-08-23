-- DropForeignKey
ALTER TABLE "public"."favorite_tags" DROP CONSTRAINT "favorite_tags_favorite_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorite_tags" DROP CONSTRAINT "favorite_tags_tag_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."favorite_tags" ADD CONSTRAINT "favorite_tags_favorite_id_fkey" FOREIGN KEY ("favorite_id") REFERENCES "public"."favorites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite_tags" ADD CONSTRAINT "favorite_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
