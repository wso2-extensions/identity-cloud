/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.wso2.carbon.identity.cloud.web.jaggery.filters;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * The Servlet filter which does session validation.
 */
public class SessionFilter implements Filter {

    private List<String> whiteListedUrls;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

        // White list login and error related resource URLs.
        whiteListedUrls = new ArrayList<>();
        whiteListedUrls.add(SessionFilterConstants.URLWhiteList.LOGIN_PAGE);
        whiteListedUrls.add(SessionFilterConstants.URLWhiteList.ERROR_PAGE);
        whiteListedUrls.add(SessionFilterConstants.URLWhiteList.ACS_PAGE);
        whiteListedUrls.add(SessionFilterConstants.URLWhiteList.SAML_REQUEST_PAGE);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpSession session = request.getSession(false);
        String requestUrl = request.getServletPath();

        if (isContextStartWithWhiteListedURLPattern(requestUrl) || (session != null && session.getAttribute
                (SessionFilterConstants.SESSION_ATTRIBUTE_NAME_USER) != null)) {
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            response.sendRedirect(request.getContextPath() + SessionFilterConstants.LOGIN_PAGE_URL);
        }
    }

    private boolean isContextStartWithWhiteListedURLPattern(String context) {

        boolean patternMatched = false;

        if (context != null && !context.isEmpty()) {
            for (String pattern : whiteListedUrls) {
                if (context.startsWith(pattern)) {
                    patternMatched = true;
                    break;
                }
            }
        }
        return patternMatched;
    }

    @Override
    public void destroy() {

    }
}
