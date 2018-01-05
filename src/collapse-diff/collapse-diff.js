'use strict';

import {h} from 'dom-chef';

export default {
    init,
    insertCollapseDiffButton
};

export function toggleDiff(section) {
    // Hide/show the diff
    const diffContentContainer = section.querySelector('div.diff-content-container');
    if (diffContentContainer) {
        diffContentContainer.classList.toggle('__refined_bitbucket_hide');
    }

    // Hide/show diff message, if present (when there are conflicts, for example)
    const diffMessageContainer = section.querySelector('div.diff-message-container');
    if (diffMessageContainer) {
        diffMessageContainer.classList.toggle('__refined_bitbucket_hide');
    }

    // Add/remove a bottom border to the diff heading
    section.querySelector('div.heading').classList.toggle('__refined_bitbucket_bottom_border');

    // Toggle the collapse button icon
    [...section.querySelectorAll('.__refined_bitbucket_collapse_diff_button svg')].forEach(svg => svg.classList.toggle('__refined_bitbucket_hide'));
}


const insertStyles = () => {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = `
        .__refined_bitbucket_hide { display: none; }
        .__refined_bitbucket_bottom_border { border-bottom: 1px solid #ccc !important; }

        .skipped-container .__rb_ellipsis {
            box-sizing: border-box;
            background: #f5f5f5;
            border: 1px solid #ccc;
            border-radius: 3px;
            box-shadow: 0 0 0 2px #fff;
            color: #707070;
            cursor: pointer;
            display: block;
            float: left;
            font-family: Arial,sans-serif;
            font-size: 20px;
            height: 16px;
            line-height: 6px;
            margin: 0 0 0 21px;
            padding: 0;
            position: absolute;
            text-align: center;
            width: 30px;
            z-index: 1
        }

        .skipped-container .__rb_ellipsis:hover {
            background-color: #e9e9e9;
            border-color: #999
        }

        .skipped-container .__rb_ellipsis::after,.skipped-container .__rb_ellipsis::before {
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 6px;
            content: '';
            height: 9px;
            left: -4px;
            position: absolute;
            width: 36px
        }

        .skipped-container .__rb_ellipsis::before {
            border-bottom: none;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            content: \'\\2026\';
            padding: 2px 0 0;
            top: -4px
        }

        .skipped-bottom .__rb_ellipsis {
            margin-top: 12px
        }

        .skipped-container:last-child .__rb_ellipsis::after {
            display: none
        }

        .aui-buttons.__rb_ellipsis::before {
            width: 38px;
            content:'';
        }
    `;
    head.appendChild(style);
};

function init() {
    insertStyles();
}

const insertTopButton = section => {
    const button = (
        <div class="aui-buttons">
            <button type="button" class="aui-button aui-button-light __refined_bitbucket_collapse_diff_button" aria-label="Toggle diff text" title="Toggle diff text">
                <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 10 16" width="10" data-arrow-direction="up">
                    <path fill-rule="evenodd" d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5z"></path>
                </svg>
                <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 10 16" width="10" class="__refined_bitbucket_hide" data-arrow-direction="down">
                    <path fill-rule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6z"></path>
                </svg>
            </button>
        </div>
    );

    const diffActions = section.querySelector('.diff-actions.secondary');
    const diffLoaded = !section.querySelector('div.too-big-message');
    if (diffLoaded) {
        // NOTE: jsdom (used for unit-testing) doesn't support either `after`, `append` nor `insertAdjacentElement`
        diffActions.insertBefore(button, diffActions.querySelector('div:nth-child(4)'));
    } else {
        diffActions.appendChild(button);
    }

    return button;
};

const insertBottomButton = section => {
    const style = {
        right: 30,
        position: 'absolute',
        height: 'auto',
        width: 32
    };
    const bottomButton = (
        <div class="aui-buttons __rb_ellipsis" style={style}>
            <button type="button" class="aui-button aui-button __refined_bitbucket_collapse_diff_button" aria-label="Toggle diff text" title="Toggle diff text" style={{height: 25}}>
                <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 10 16" width="10">
                    <path fill-rule="evenodd" d="M10 10l-1.5 1.5L5 7.75 1.5 11.5 0 10l5-5z"></path>
                </svg>
                <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 10 16" width="10" class="__refined_bitbucket_hide">
                    <path fill-rule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6z"></path>
                </svg>
            </button>
        </div>
    );

    const bottomLine = section.querySelector('div.skipped-bottom.last:last-child');
    if (bottomLine) {
        bottomLine.appendChild(bottomButton);
    } else {
        const contentContainer = section.querySelector('div.refract-content-container');
        if (contentContainer) {
            bottomButton.style.marginTop = 0;
            const height = {height: 5};
            const bottomLineContainer = (
                <div class="skipped-container">
                    <div class="line-numbers-skipped skipped-bottom last" style={height}></div>
                    <div class="skipped-bottom last" style={height}>
                        {bottomButton}
                    </div>
                </div>
            );
            contentContainer.appendChild(bottomLineContainer);
        }
    }

    return bottomButton;
};

function insertCollapseDiffButton(section) {
    // don't reinsert the button if already present.
    // doesn't happen with vanilla Bitbucket, but can happen when interacting
    // with other extensions (like Bitbucket Diff Tree)
    if (section.getElementsByClassName('__refined_bitbucket_collapse_diff_button').length) {
        return;
    }

    const onClick = () => {
        toggleDiff(section);

        // Scrolling to diff
        section.scrollIntoView({behavior: 'smooth', block: 'start'});
    };

    const topButton = insertTopButton(section);
    const bottomButton = insertBottomButton(section);

    topButton.addEventListener('click', onClick);
    bottomButton.addEventListener('click', onClick);
}
