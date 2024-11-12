import { ThemeType } from "./types";

export const panelStyle = {
  borderBottom: "1px solid #606060",
  padding: "20px 12px 20px 20px",
  // marginBottom: "16px",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "flex-start",
  gap: "8px",
  alignSelf: "stretch",
  // fontFamily: "SF Pro Text",
};

export const titleStyle = {
  display: "flex",
  width: "212px",
  height: "16px",
  flexDirection: "column" as const,
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: 800,
  lineHeight: "normal",
};

export const subtitleStyle = {
  alignSelf: "stretch",
  fontSize: "11px",
  fontWeight: 500,
  lineHeight: "normal",
  marginBottom: "3px",
};

export const gridStyle = (customizations = {}) => ({
  display: "grid",
  alignItems: "center",
  marginBottom: "5px",
  ...customizations,
});

export const overviewGridStyle = (customizations = {}) => ({
  ...gridStyle({
    gridTemplateColumns: "auto auto",
    width: "255px", 
    ...customizations,
  }),
});

export const detailsGridStyle = (theme: ThemeType, customizations = {}) => ({
  ...gridStyle({
    gridTemplateColumns: "auto auto auto auto", 
    borderRadius: "3px", 
    border: `1px solid ${theme === "Dark" ? "#3C3C3C" : "#E0E0E0"}`, 
    background: theme === "Dark" ? "#1E1E1E" : "#FFFFFF", 
    padding: "8px 16px", 
    width: "225px",
    ...customizations,
  }),
});

export const gridItemStyle = (customizations = {}) => ({
  flex: "1 0 0",
  fontWeight: "500",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "2px",
  ...customizations,
});

export const detailsCollapseButtonStyle = {
  cursor: "pointer",
  color: "#3794FF",
  fontSize: "13px",
  fontStyle: "normal",
  fontWeight: 500,
  lineHeight: "normal",
};
