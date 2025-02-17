import mongoose from "mongoose";

const TemplateNegotiationSchema = new mongoose.Schema(
  {
    negotiation_id: 
    { 
        type: Number, 
        required: true, 
        unique: true 
    }, // Unique identifier
    negotiation_description: 
    { 
        type: String, 
        required: true 
    }, // Description of the negotiation
    negotiation_type: {
      type: String,
      enum: ["Field", "Fail"], // Allowed values: Field, Fail
      required: true,
    },
    commision: { 
        type: Number, 
        required: true, 
        min: 0
     }, // Commission percentage or amount
    abbreviation: { 
        type: String, 
        required: true 
    }, // Short form or abbreviation
    end_dtm: { 
        type: Date, 
        required: true 
    }, // End date/time
    todo_id: {
        type: Number,
        required: true,
        unique: true
    },
    task_id: {
        type: Number,
        required: true,
        unique: true
    },
  },
  {
    collection: 'Template_Negotiation',
  }
);

const TemplateNegotiation = model("Template_Negotiation", TemplateNegotiationSchema);

export default TemplateNegotiation;
