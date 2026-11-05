import mongoose from "mongoose";

const PartryMasterSchema = new mongoose.Schema(
  {
    party_type: {
      type: String,
      required: true,
      enum: [
        "person",
        "family",
        "customer",
        "supplier",
        "vendor",
        "company",
        "employer",
        "employee",
        "client",
        "store",
        "supermarket",
        "bank",
        "lender",
        "borrower",
        "creditcard",
        "lifeinsurance",
        "vehicleinsurance",
        "healthinsurance",
        "government",
        "hospital",
        "doctor",
        "school",
        "college",
        "landlord",
        "tenant",
        "utility",
        "serviceprovider",
        "broker",
        "investmentfirm",
        "other",
      ],
    },
    party_name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

    userid: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  },
);

export const PartyMaster = mongoose.model("partyMaster", PartryMasterSchema);
