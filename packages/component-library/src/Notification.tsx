import React, { useContext } from 'react';
import cx from 'clsx';
import styled, { StyledInterface } from 'styled-components';
import { createStyleBuilder, createBootstrap } from './helpers';

interface Props {
  id?: string;
  children?: React.ReactNode;
  closable?: boolean;
  className?: string;
  style?: object;
  [key: string]: any;
}

interface Context {
  checkboxId: string;
  styleProps: object;
  Sheader: any;
  Scontent: any;
  Sgroup: any;
  Sclose: any;
}

const CONTAINER_CLASS = 'pg-notification';
const HEADER_CLASS = 'pg-header';
const CONTENT_CLASS = 'pg-content';
const CLOSE_CLASS = 'pg-close';

const InvisibleCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  left: -100vw;

  &:checked + .${CONTAINER_CLASS} {
    display: none;
  }
`;

const initialContext: Context = {
  checkboxId: '',
  styleProps: {},
  Sheader: null,
  Scontent: null,
  Sgroup: null,
  Sclose: null,
};

const NotificationContext = React.createContext(initialContext);

export const applyTheme = (styles, config, childStyles = {}) => {
  const styleBuilder = createStyleBuilder(styles, config, childStyles);
  const Scontainer = styleBuilder('div', 'container');
  const Sheader = styleBuilder('div', 'header');
  const Scontent = styleBuilder('div', 'content');
  const Sgroup = styleBuilder('div', 'group');
  const Sclose = styleBuilder('label', 'close');

  const bootstrap = createBootstrap(styles, 'notification');

  const BaseComponent = (props: Props) => {
    const { id, name, label, ariaLabel, styleProps, children, className, rest } = bootstrap(props);
    const { closable, others } = rest;

    const checkboxId = `${id}-toggle`;

    return (
      <NotificationContext.Provider value={{ checkboxId, styleProps, Sheader, Scontent, Sgroup, Sclose }}>
        {closable && <InvisibleCheckbox id={checkboxId} />}
        <Scontainer {...styleProps} {...others} className={cx(CONTAINER_CLASS, className)}>
          {children}
        </Scontainer>
      </NotificationContext.Provider>
    );
  };

  BaseComponent.Header = props => {
    const { children, className, ...rest } = props;
    const classes = cx(HEADER_CLASS, className);
    const { Sheader, styleProps } = useContext(NotificationContext);

    return (
      <Sheader className={classes} {...styleProps} {...rest}>
        {children}
      </Sheader>
    );
  };

  BaseComponent.Content = props => {
    const { children, className, ...rest } = props;
    const classes = cx(CONTENT_CLASS, className);
    const { Scontent, styleProps } = useContext(NotificationContext);

    return (
      <Scontent className={classes} {...styleProps} {...rest}>
        {children}
      </Scontent>
    );
  };

  BaseComponent.Group = props => {
    const { children, className, ...rest } = props;
    const classes = cx(CONTENT_CLASS, className);
    const { Sgroup, styleProps } = useContext(NotificationContext);

    return (
      <Sgroup className={classes} {...styleProps} {...rest}>
        {children}
      </Sgroup>
    );
  };

  BaseComponent.Close = props => {
    const { children, className, ...rest } = props;
    const classes = cx(CLOSE_CLASS, className);
    const { Sclose, checkboxId, styleProps } = useContext(NotificationContext);

    return (
      <Sclose className={classes} htmlFor={checkboxId} {...styleProps} {...rest}>
        {children}
      </Sclose>
    );
  };

  return BaseComponent;
};

const Notification = applyTheme({}, {}, {});

export default Notification;
