import { isValidUrl, normalizeUrl } from "@/tools/url.tools";
import { Organisation } from "@/types";

// components/ResultsPanel.tsx
type ResultPanelProps = {
  organisations?: Organisation[];
};
const ResultsPanel = ({ organisations = [] }: ResultPanelProps) => {
  return (
    <div className="w-[400px] max-w-[400px] h-full overflow-y-auto">
      <h3 className="text-xl font-semibold">Results</h3>
      <div className="flex flex-col gap-1.5 mt-2 w-full">
        {organisations.map((org) => (
          <div
            key={org.id}
            className="bg-[#e5e3d9] text-black w-full p-2 rounded-sm shadow-sm flex flex-col"
          >
            <h4 className="font-bold text-sm">{org.name}</h4>
            <i className="text-xs text-gray-600 pb-1">
              {org.location.address_line1}, {org.location.city},{" "}
              {org.location.state} {org.location.zip_code}
            </i>
            <p className="text-xs line-clamp-2">{org.description}</p>
            {org.website && isValidUrl(org.website) ? (
              <a
                href={normalizeUrl(org.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-xs mt-1 hover:underline"
              >
                {org.website}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
