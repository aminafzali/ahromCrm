import { BaseRepository } from "@/@Client/Http/Repository/BaseRepository";
import { ChatbotSessionDTO } from "../types";

export class ChatbotRepository extends BaseRepository<
  ChatbotSessionDTO,
  number
> {
  constructor() {
    super("chatbot");
  }
}
