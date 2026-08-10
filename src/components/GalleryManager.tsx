"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";

export default function galleryManager({
  initialUrls,
}: {
  initialUrls: string[];
}) {
  const [urls, setUrls] = useState<string[]>(initialUrls || []);

  const handleRemove = (urlToRemove: string) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };

  return (
    <div>
      {urls.map((url) => (
        <div key={url}>
          <div className="flex">
            <img src={url} alt="" width="150px" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="cursor-pointer"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
      <input
        type="hidden"
        name="remaining_gallery"
        value={JSON.stringify(urls)}
      />
    </div>
  );
}
