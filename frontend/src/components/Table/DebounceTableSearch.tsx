import React, {useEffect, useState} from 'react';
import Grow from '@material-ui/core/Grow';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles';
import {useDebounce} from "../../utils/hooks";
import {limparSearch} from "./index";

const useStyles = makeStyles(
    theme => ({
        main: {
            display: 'flex',
            flex: '1 0 auto',
        },
        searchIcon: {
            color: theme.palette.text.secondary,
            marginTop: '10px',
            marginRight: '8px',
        },
        searchText: {
            flex: '0.8 0',
        },
        clearIcon: {
            '&:hover': {
                color: theme.palette.error.main,
            },
        },
    }),
    { name: 'MUIDataTableSearch' },
);

let notOnSearch = false;

const DebounceTableSearch = ({ options, searchText, onSearch, onHide }) => {
    const classes = useStyles();

    const [searchTextState, setSearchTextState] = useState<string>(!searchText || searchText === limparSearch ? '' : searchText);
    const searchTextDebounce = useDebounce(searchTextState, 500);
    const searchTextOrigDebounce = useDebounce(searchText, 50);

    // console.log({searchText, searchTextState, searchTextDebounce});

    useEffect(() => {
        if (notOnSearch) {
            notOnSearch = false;
            return;
        }
        onSearch(searchTextDebounce);
    }, [searchTextDebounce, onSearch]);

    useEffect(() => {
        if (searchTextOrigDebounce !== limparSearch) return;

        if (searchTextState !== '') {
            notOnSearch = true;
            setSearchTextState('');
        }
    }, [searchTextOrigDebounce, onSearch]);

    const handleTextChange = event => {
        setSearchTextState(event.target.value);
    };

    const onKeyDown = event => {
        if (event.key === 'Escape') {
            onHide();
        }
    };

    return (
        <Grow appear in={true} timeout={300}>
            <div className={classes.main}>
                <SearchIcon className={classes.searchIcon} />
                <TextField
                    className={classes.searchText}
                    autoFocus={true}
                    InputProps={{
                        'data-test-id': options.textLabels.toolbar.search,
                    }}
                    inputProps={{
                        'aria-label': options.textLabels.toolbar.search,
                    }}
                    value={searchTextState || ''}
                    onKeyDown={onKeyDown}
                    onChange={handleTextChange}
                    fullWidth={true}
                    placeholder={options.searchPlaceholder}
                    {...(options.searchProps ? options.searchProps : {})}
                />
                <IconButton className={classes.clearIcon} onClick={onHide}>
                    <ClearIcon />
                </IconButton>
            </div>
        </Grow>
    );
};

export default DebounceTableSearch;
