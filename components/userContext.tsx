import React from 'react';

const UserContext = React.createContext({
                                            userUIDString: '',
                                            userIsAdminContextValue: false
                                        });

export { UserContext };