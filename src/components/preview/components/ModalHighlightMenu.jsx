import React from "react";
import {HighlightMenu} from "react-highlight-menu";
import {FaAlignCenter, FaAlignLeft, FaAlignRight, FaBold, FaItalic, FaMinus, FaPlus, FaUnderline} from "react-icons/fa";
import useKeyboardShortcut from "../../../hooks/useKeyboardShortcut";

const ModalHighlightMenu = () => {
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const toggleBold = () => formatText("bold");
  const toggleItalic = () => formatText("italic");
  const toggleUnderline = () => formatText("underline");
  const changeFontSize = (size) => formatText("fontSize", size);
  const alignText = (alignment) => formatText(`justify${alignment}`);

  /* Hot keys */
  useKeyboardShortcut("b", true, toggleBold);
  useKeyboardShortcut("i", true, toggleItalic);
  useKeyboardShortcut("u", true, toggleUnderline);

  const MenuButton = ({title, icon, onClick}) => (
    <button
      onClick={onClick}
      title={title}
      className="p-2 text-white hover:bg-blue-700 active:scale-90 transition-all duration-150 rounded font-semibold"
    >
      {icon}
    </button>
  );

  return (
    <div className="exclude-print print-hidden">
      <HighlightMenu
        styles={{
          borderColor: "#2563EB",
          backgroundColor: "#2563EB",
          boxShadow: "0px 8px 16px 0px rgba(0, 0, 0, 0.2)",
          zIndex: 10,
          borderRadius: "8px",
          padding: "4px",
        }}
        target="body"
        menu={() => (
          <>
            <MenuButton title="Bold (Ctrl+B)" icon={<FaBold/>} onClick={toggleBold}/>
            <MenuButton title="Italic (Ctrl+I)" icon={<FaItalic/>} onClick={toggleItalic}/>
            <MenuButton title="Underline (Ctrl+U)" icon={<FaUnderline/>} onClick={toggleUnderline}/>
            <MenuButton title="Increase Font Size" icon={<FaPlus/>} onClick={() => changeFontSize(4)}/>
            <MenuButton title="Decrease Font Size" icon={<FaMinus/>} onClick={() => changeFontSize(2)}/>
            <MenuButton title="Align Left" icon={<FaAlignLeft/>} onClick={() => alignText("Left")}/>
            <MenuButton title="Align Center" icon={<FaAlignCenter/>} onClick={() => alignText("Center")}/>
            <MenuButton title="Align Right" icon={<FaAlignRight/>} onClick={() => alignText("Right")}/>
          </>
        )}
      />
    </div>
  );
};

export default ModalHighlightMenu;
