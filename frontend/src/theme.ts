import {createMuiTheme, SimplePaletteColorOptions} from "@material-ui/core";
import {PaletteOptions} from "@material-ui/core/styles/createPalette";
import {green, red} from "@material-ui/core/colors";

const palette: PaletteOptions = {
    primary: {
        main: "#79aec8",
        contrastText: "#fff"
    },
    secondary: {
        main: "#4db5ab",
        contrastText: "#fff",
        dark: "#055a52"
    },
    background: {
        default: "#fafafa"
    },
    success: {
        main: green["500"],
        contrastText: "#fff"
    },
    error: {
        main: red["500"],
        contrastText: "#fff"
    }
}

const primary = (palette!.primary as SimplePaletteColorOptions).main;
const secondary = (palette!.secondary as SimplePaletteColorOptions).main;
const secondaryDark = (palette!.secondary as SimplePaletteColorOptions).dark;
const background = palette!.background!.default;

const theme = createMuiTheme({
    palette,
    overrides: {
        MUIDataTable: {
            paper: {
                boxShadow: "none"
            }
        },
        MUIDataTableToolbar: {
            root: {
                minHeight: '18px',
                backgroundColor: background
            },
            icon: {
                color: primary,
                '&:hover, &:active, &.focus': {
                    color: secondaryDark
                }
            },
            iconActive: {
                color: secondaryDark,
                '&:hover, &:active, &.focus': {
                    color: secondaryDark
                }
            }
        },
        MUIDataTableHeadCell: {
            fixedHeader: {
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: primary,
                color: '#ffffff',
                '&[aria-sort]': {
                    backgroundColor: '#459ac4',
                }
            },
            sortActive: {
                color: '#ffffff'
            },
            sortAction: {
                alignItems: 'center'
            },
            sortLabelRoot: {
                '& svg': {
                    color: '#ffffff !important'
                }
            }
        },
        MUIDataTableSelectCell: {
            headerCell: {
                backgroundColor: primary,
                '& span': {
                    color: '#ffffff !important'
                }
            }
        },
        MUIDataTableBodyCell: {
            root: {
                color: secondary,
                '&:hover, &:active, &.focus': {
                    color: secondary
                }
            }
        },
        MUIDataTableBodyRow: {
            root: {
                '&:nth-child(odd)': {
                    backgroundColor: background
                }
            }
        },
        MUIDataTableToolbarSelect: {
            title: {
                color: primary,
            },
            iconButton: {
                color: primary
            }
        },
        MUIDataTablePagination: {
            root: {
                color: primary
            }
        }
    }
});

export default theme;
