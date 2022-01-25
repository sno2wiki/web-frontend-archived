import { useParams } from "react-router-dom";
import useSWR from "swr";
import { Document, Lines } from "~/components/Document";
import { CaptureData } from "~/components/types";
import { createLineId } from "~/generators/id";

export const calcDocumentEndpoint = (id: string) =>
  "http://0.0.0.0:8000/docs/" + id;

export const DocumentPage: React.VFC = () => {
  const { id } = useParams<"id">();
  const { data } = useSWR<{ lines: Lines }>(id && calcDocumentEndpoint(id));

  const handleMethods = (data: CaptureData) => {
    console.dir(data);
  };

  return (
    <div style={{ margin: "64px 64px" }}>
      <span>{id}</span>
      {data && (
        <Document
          initLines={data.lines}
          handleMethod={handleMethods}
        ></Document>
      )}
    </div>
  );
};
