CREATE TABLE "call_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "call_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"virtual_number_id" integer NOT NULL,
	"incoming_number" varchar(50) NOT NULL,
	"start_time" timestamp NOT NULL,
	"durationSeconds" integer NOT NULL,
	"status" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "text_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "text_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"virtual_number_id" integer NOT NULL,
	"incoming_number" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"receivedAt" timestamp NOT NULL,
	"multimedia" boolean DEFAULT false,
	"status" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "usage_metrics" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "usage_metrics_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"virtualNumberId" integer,
	"forwarded_calls" integer DEFAULT 0,
	"forwarded_texts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"phone_number" varchar(255) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"email" varchar(255),
	"disabled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "virtual_numbers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "virtual_numbers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"phone_number" varchar(50) NOT NULL,
	"network_id" varchar(255) NOT NULL,
	"resource_id" varchar(255),
	"country_code" varchar(3),
	"area_code" varchar(10),
	"forwarding_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_virtual_number_id_virtual_numbers_id_fk" FOREIGN KEY ("virtual_number_id") REFERENCES "public"."virtual_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_logs" ADD CONSTRAINT "text_logs_virtual_number_id_virtual_numbers_id_fk" FOREIGN KEY ("virtual_number_id") REFERENCES "public"."virtual_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_metrics" ADD CONSTRAINT "usage_metrics_virtualNumberId_virtual_numbers_id_fk" FOREIGN KEY ("virtualNumberId") REFERENCES "public"."virtual_numbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "virtual_numbers" ADD CONSTRAINT "virtual_numbers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;