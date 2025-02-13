import connectionToDB from "../../../lib/mongoose";
import QuestionHistory from "../../../models/History";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectionToDB();
    const body = await req.json();

    if (!body.text) {
      return NextResponse.json({ message: "Question is required" }, { status: 400 });
    }

    const newQuestion = new QuestionHistory({ 
      text: body.text, 
      starred: body.starred || false 
    });

    await newQuestion.save();
    return NextResponse.json({ message: "Question saved successfully", data: newQuestion }, { status: 201 });

  } catch (error) {
    console.error("Error saving question:", error.message);
    return NextResponse.json({ message: "Error saving question", error: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    await connectionToDB();
    const history = await QuestionHistory.find().sort({ timestamp: -1 });

    return NextResponse.json({ data: history }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Error fetching history", error }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectionToDB();
    const body = await req.json();
    const { id, starred } = body;

    if (!id) {
      return NextResponse.json({ message: "Message ID is required" }, { status: 400 });
    }

    const updatedMessage = await QuestionHistory.findByIdAndUpdate(id, { starred }, { new: true });

    if (!updatedMessage) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Star status updated", data: updatedMessage }, { status: 200 });

  } catch (error) {
    console.error("Error updating star status:", error.message);
    return NextResponse.json({ message: "Error updating star status", error: error.message }, { status: 500 });
  }
}

