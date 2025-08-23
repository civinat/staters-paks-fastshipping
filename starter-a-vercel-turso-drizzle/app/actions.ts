"use server";

export async function createLead(data: { email: string }) {
  console.log("Lead:", data.email);
}
