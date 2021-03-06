import styled from 'styled-components';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';
import join from 'lodash/join';
import isPlainObject from 'lodash/isPlainObject';

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const staticStyles = {
  fullWidth: `width:100%;`,
  fullHeight: `height:100%;`,
};

// Using this to pull off style related static props. If including non-style props, will need refactor
export const staticProps = Object.keys(staticStyles);

export const getStyleKeys = styles => {
  const { shared = {}, ...others } = styles;
  return Object.keys(others);
};

export interface StyleConfig {
  defaultProps?: object;
  staticProps?: string[];
  breakProps?: string[];
  [key: string]: any;
}

export function createStyleBuilder(styles: any, config: StyleConfig, childStyles: any = {}) {
  const { shared = {}, ...others } = styles;
  const defaultProps = config.defaultProps || {};
  const staticProps = config.staticProps || [];
  const breakProps = config.breakProps || [];

  const styleKeys = Object.keys(others);
  const childStyleKeys = mapValues(childStyles, style => Object.keys(style));

  const isTrue = (props: object, key: string): boolean => {
    if (props[key] === false) return false;
    if (props[key] === true || defaultProps[key] === true) return true;
    return false;
  };

  return function (tag: any, type: string) {
    const base = isString(tag) ? styled[tag] : styled(tag);

    return base`
      ${(props: any) => {
        let styles = shared[type] || '';

        const concatStyle = (props, key) => {
          const style = others[key];
          if (isString(style)) {
            if (isTrue(props, key)) styles += style;
            return;
          }

          const values = Object.keys(style);
          const first = values[0];

          let value = props[key];

          if (isString(style[first])) {
            if (isBoolean(value)) {
              if (isTrue(props, key)) styles += style[type] || '';
            } else {
              if (!style[value]) value = defaultProps[key] || first;
              styles += style[value] || '';
            }
          } else {
            if (!style[value]) value = defaultProps[key] || first;
            styles += (style[value] && style[value][type]) || '';
          }
        };

        const concatChildStyle = (props, key) => {
          const style = childStyles[type][key] || '';
          if (isString(style)) {
            if (isTrue(props, key)) styles += style;
            return;
          }

          const value = props[key];
          styles += style[value] || '';
        };

        let breakProp;
        const hasBreakProp = breakProps.some(br => {
          if (props[br]) {
            breakProp = br;
            return true;
          }
          return false;
        });

        if (hasBreakProp) {
          concatStyle(props, breakProp);
          return styles;
        }

        forEach(staticProps, key => {
          if (isTrue(props, key)) styles += staticStyles[key];
        });

        forEach(styleKeys, key => {
          concatStyle(props, key);
        });

        forEach(childStyleKeys[type], key => {
          concatChildStyle(props, key);
        });

        return styles;
      }}
    `;
  };
}

export function createBootstrap(styles: any, type: string) {
  const styleKeys = getStyleKeys(styles).concat(staticProps);

  return function (props: any) {
    let { id, name } = props;
    const { label, children, className, ...rest } = props;

    if (!id) {
      id = generateId();
    }

    if (!name) {
      name = `${id}-${type}`;
    }

    const ariaLabel = label || name;

    const styleProps = pickBy(rest, (_, propName) => styleKeys.includes(propName));

    return { id, name, label, ariaLabel, styleProps, children, className, rest };
  };
}

const addSemicolon = str => (str.trim().endsWith(';') ? str : `${str};`);

const removeNewline = str => str.replace(/(\r\n|\n|\r)/gm, '').trim();

const isNotEmptyString = str => !!str;

export function processStyle(styles: object) {
  const processedStyle = reduce(
    styles,
    (ret: object, val: any, key: string) => {
      ret[key] = isPlainObject(val) ? processStyle(val) : Array.isArray(val) ? join(val.map(addSemicolon), '') : val;
      return ret;
    },
    {}
  );

  return processedStyle;
}

export function convertToArrayStyle(styles: object) {
  const processedStyle = reduce(
    styles,
    (ret: object, val: any, key: string) => {
      ret[key] = isPlainObject(val)
        ? convertToArrayStyle(val)
        : isString(val)
        ? val.split(';').map(removeNewline).filter(isNotEmptyString)
        : val;
      return ret;
    },
    {}
  );

  return processedStyle;
}
