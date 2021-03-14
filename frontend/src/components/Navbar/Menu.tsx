// @flow
import * as React from 'react';
import {IconButton, Menu as MenuCore, MenuItem} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import routes, {MyRouteProps} from "../../routes";
import {Link} from "react-router-dom";

const listRoutes = [
    'dashboard',
    'categories.list',
];
const menuRoutes = routes.filter(route => listRoutes.includes(route.name));

export const Menu = () => {

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = (event: any) => setAnchorEl(null);

    return (
        <React.Fragment>
            <IconButton
                edge="start"
                color="inherit"
                aria-label="Open drawer"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <MenuIcon />
            </IconButton>

            <MenuCore
                id="menu-appbar"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                transformOrigin={{vertical: 'top', horizontal: 'center'}}
                getContentAnchorEl={null}
            >
                {
                    listRoutes.map(
                        (routeName, key) => {
                            const route = menuRoutes.find(route => route.name === routeName) as MyRouteProps;
                            return (
                                <MenuItem key={key} component={Link} to={route.path as string}>
                                    {route.label}
                                </MenuItem>
                            )
                        }
                    )
                }
            </MenuCore>
        </React.Fragment>
    );
};
