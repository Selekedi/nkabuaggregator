import { useEffect, useState } from "react";
import FuzeSearchBar from "./FuzeSearchBar";
import { crops} from "../../Server/crops";

const renderCrop = (item, { isHighlighted }) => (
    <div className={`search-result crop ${isHighlighted ? "highlighted" : ""}`}>
        <span>
            {item}
        </span>
    </div>
)



export default function CropsFusySearchBar({onSelect}){

    

    return (
        <FuzeSearchBar
            data={crops}
            placeholder={"Search Crop"}
            onSelect={onSelect}
            renderItem={renderCrop}
        />
    )
}
