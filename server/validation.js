const { z } = require("zod");

const subscribeSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .max(254, "That email address is too long."),
});

function formatIssues(error) {  // Flatten Zod error
  const fieldErrors = z.flattenError(error).fieldErrors;

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ])
  );
}

module.exports = { subscribeSchema, formatIssues };
