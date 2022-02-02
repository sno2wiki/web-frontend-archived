import { nanoid } from "nanoid";
import { ulid } from "ulid";

export const createCommitId = () => ulid();
export const createLineId = () => nanoid(16);
