package org.wso2.carbon.identity.cloud.web.jaggery;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * The Servlet filter which does session validation.
 */
public class SessionFilter implements Filter {

    public static final String LOGIN_PAGE_URL = "/login.jag";
    public static final String SESSION_ATTRIBUTE_NAME_USER = "user";

    private List<String> whiteListedUrls;


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

        // White list login related resource URLs.
        whiteListedUrls = new ArrayList<String>();
        whiteListedUrls.add(LOGIN_PAGE_URL);
        whiteListedUrls.add("/samlsso.jag");
        whiteListedUrls.add("/acs");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpSession session = request.getSession();
        String requestUrl = request.getServletPath();

        if (whiteListedUrls.contains(requestUrl) || (session != null && session.getAttribute
                (SESSION_ATTRIBUTE_NAME_USER) != null)) {
            filterChain.doFilter(servletRequest, servletResponse);
        } else {
            HttpServletResponse response = (HttpServletResponse) servletResponse;
            response.sendRedirect(request.getContextPath() + LOGIN_PAGE_URL);
        }

    }

    @Override
    public void destroy() {

    }
}
