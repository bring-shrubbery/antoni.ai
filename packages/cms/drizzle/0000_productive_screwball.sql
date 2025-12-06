CREATE TABLE "cms_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_content_entry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type_id" uuid NOT NULL,
	"data" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text,
	"updated_by_id" text
);
--> statement-breakpoint
CREATE TABLE "cms_content_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"schema" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" text,
	CONSTRAINT "cms_content_type_name_unique" UNIQUE("name"),
	CONSTRAINT "cms_content_type_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"filename" text NOT NULL,
	"original_filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"url" text NOT NULL,
	"bucket_path" text NOT NULL,
	"alt" text,
	"caption" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"uploaded_by_id" text
);
--> statement-breakpoint
CREATE TABLE "cms_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "cms_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "cms_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cms_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cms_account" ADD CONSTRAINT "cms_account_user_id_cms_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cms_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content_entry" ADD CONSTRAINT "cms_content_entry_content_type_id_cms_content_type_id_fk" FOREIGN KEY ("content_type_id") REFERENCES "public"."cms_content_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content_entry" ADD CONSTRAINT "cms_content_entry_created_by_id_cms_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."cms_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content_entry" ADD CONSTRAINT "cms_content_entry_updated_by_id_cms_user_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."cms_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content_type" ADD CONSTRAINT "cms_content_type_created_by_id_cms_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."cms_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_media" ADD CONSTRAINT "cms_media_uploaded_by_id_cms_user_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."cms_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_session" ADD CONSTRAINT "cms_session_user_id_cms_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."cms_user"("id") ON DELETE cascade ON UPDATE no action;