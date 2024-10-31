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

export const gridStyle = (columns: string) => ({
  display: "grid",
  gridTemplateColumns: columns,
  alignItems: "center",
  marginBottom: "5px",
});

export const gridItemStyle = {
  flex: "1 0 0",
  fontWeight: "500",
  fontSize: "13px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
