import { SchemaType, Schema } from "@google/generative-ai";

export const OUTPUT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "The title of the generated quiz.",
    },
    description: {
      type: SchemaType.STRING,
      description: "A brief description of the quiz.",
    },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: "Title of the section.",
          },
          description: {
            type: SchemaType.STRING,
            description: "Description of the section.",
          },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                type: {
                  type: SchemaType.STRING,
                  format: "enum",
                  enum: ["multiple_choice", "true_false", "short_answer", "long_answer", "fill_in_blank"],
                  description: "The type of question.",
                },
                question: {
                  type: SchemaType.STRING,
                  description: "The question text.",
                },
                options: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description: "List of options for multiple_choice questions.",
                },
                answer: {
                  type: SchemaType.STRING,
                  description: "The correct answer. For true/false, use 'True' or 'False'.",
                },
              },
              required: ["type", "question", "answer"],
            },
          },
        },
        required: ["questions"],
      },
    },
  },
  required: ["title", "sections"],
};