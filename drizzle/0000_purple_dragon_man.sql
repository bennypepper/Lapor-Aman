CREATE TABLE "rate_limits" (
	"key" varchar(191) PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"ticket_id" varchar(64) NOT NULL,
	"user_id" varchar(64),
	"website_url" text NOT NULL,
	"category" varchar(128) DEFAULT 'Situs Taruhan / Casino' NOT NULL,
	"details" text NOT NULL,
	"evidence_url" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"reporter_name" varchar(255) DEFAULT 'Anonim' NOT NULL,
	"reporter_email" varchar(255) DEFAULT '',
	"encrypted_phone" text DEFAULT '',
	"encrypted_nik" text DEFAULT '',
	"encrypted_address" text DEFAULT '',
	"status" varchar(64) DEFAULT 'BARU' NOT NULL,
	"status_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(32) DEFAULT 'USER' NOT NULL,
	"encrypted_nik" text DEFAULT '',
	"encrypted_phone" text DEFAULT '',
	"encrypted_address" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "rate_limits_reset_at_idx" ON "rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "reports_user_id_idx" ON "reports" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reports_reporter_email_idx" ON "reports" USING btree ("reporter_email");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reports_status_created_at_idx" ON "reports" USING btree ("status","created_at");