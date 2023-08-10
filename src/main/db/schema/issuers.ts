import { InferModel } from "drizzle-orm";
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const issuers = sqliteTable("issuers", {
    id: integer("id").primaryKey(),
    name: text("name"),
    initials: text("initials").unique(),
    vouchers_issued: integer("vouchers_issued")
})

export type Issuer = InferModel<typeof issuers>;
