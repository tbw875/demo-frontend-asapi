import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#457B9D",
    },
    secondary: {
      main: "#E63946",
    },
    text: {
      primary: "#F1FAEE",
      secondary: "#A8DADC",
    },
    background: {
      default: "#1D3557",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: "#F1FAEE", // your primary text color
          backgroundColor: "#1D3557", // your background color
        },
      },
    },
  },
});

export default theme;
