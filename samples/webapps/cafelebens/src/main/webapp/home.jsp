<!--
~ Copyright (c) WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
~
~ WSO2 Inc. licenses this file to you under the Apache License,
~ Version 2.0 (the "License"); you may not use this file except
~ in compliance with the License.
~ You may obtain a copy of the License at
~
~    http://www.apache.org/licenses/LICENSE-2.0
~
~ Unless required by applicable law or agreed to in writing,
~ software distributed under the License is distributed on an
~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
~ KIND, either express or implied.  See the License for the
~ specific language governing permissions and limitations
~ under the License.
-->
<%@ page import="org.wso2.carbon.identity.sso.agent.bean.LoggedInSessionBean" %>
<%@ page import="org.wso2.carbon.identity.sso.agent.SSOAgentConstants" %>


<%@ page contentType="text/html;charset=UTF-8" language="java" pageEncoding="UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>CafeLebens - Foods for you</title>

    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="keywords" content="">
    <meta name="description" content="">
    <!--


    -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/animate.min.css">
    <link rel="stylesheet" href="css/font-awesome.min.css">
    <link rel="stylesheet" href="css/nivo-lightbox.css">
    <link rel="stylesheet" href="css/nivo_themes/default/default.css">
    <link rel="stylesheet" href="css/style.css">
    <link href='https://fonts.googleapis.com/css?family=Roboto:400,500' rel='stylesheet' type='text/css'>
</head>

<%
    String domin =  (String)session.getAttribute("tenantDomain");
    String claimedId = null;
    String subjectId = null;
    if(request.getSession(false) != null &&
            request.getSession(false).getAttribute(SSOAgentConstants.SESSION_BEAN_NAME) == null){
        request.getSession(false).invalidate();
%>
<script type="text/javascript">
    location.href = "index.jsp?tenantDomain=<%=domin%>";
</script>
<%
        return;
    }
    LoggedInSessionBean sessionBean = (LoggedInSessionBean)session.getAttribute(SSOAgentConstants.SESSION_BEAN_NAME);
    if(sessionBean != null){
        if(sessionBean.getOpenId() != null) {
            claimedId = sessionBean.getOpenId().getClaimedId();

        } else if(sessionBean.getSAML2SSO() != null) {
            subjectId = sessionBean.getSAML2SSO().getSubjectId();

        } else {
%>
<script type="text/javascript">
    location.href = "index.jsp?tenantDomain=<%=domin%>";
</script>
<%
        return;
    }
} else {
%>
<script type="text/javascript">
    location.href = "index.jsp?tenantDomain=<%=domin%>";
</script>
<%
        return;
    }
%>



<body>

<!-- preloader section -->
<section class="preloader">
    <div class="sk-spinner sk-spinner-pulse"></div>
</section>

<!-- navigation section -->
<section class="navbar navbar-default navbar-fixed-top" role="navigation">
    <div class="container">
        <div class="navbar-header">
            <button class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                <span class="icon icon-bar"></span>
                <span class="icon icon-bar"></span>
                <span class="icon icon-bar"></span>
            </button>
            <a href="#" class="navbar-brand">CafeLebens</a>
        </div>
        <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav navbar-right">
                <li><a href="#home" class="smoothScroll">HOME</a></li>
                <li><a href="#gallery" class="smoothScroll">FOOD GALLERY</a></li>
                <li><a href="#menu" class="smoothScroll">SPECIAL MENU</a></li>
                <li><a href="#contact" class="smoothScroll">RESERVE </a></li>
                <li class="user-profile dropdown">



                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAD0klEQVRIS41WbWxTZRR+zvt2GQ6FMfE7wuyMygoRzCRi1AQxaKKszQTstrYiQY1GnGu7pTqNQSdmY60iMQ74oevqYMO4dfuBgTl+uIyYGUTn9kOnMAjyQ2GKm5tb73vMbdNlu7fteH81fc45z/M+55x7LyHDcTxbVcBKc4JoPTRl0yCuj4cL/CkJQ1DoUUSHupobzqQrQ6mAp8sqrTEp6wEuAZAyZlYeE+gLyFh1x2cfnjXWMyXbXV6PImoUwDWZbmfCFP9LEi92hEOR2dgcArvHFwDjfWNyQf5tKC15HCvvKYC0SPw8PIK2aDd+GPzFrIG5KhoJNSSBGQJdOYiajBlFq1cg8Oo2WCxyDsTMOBBux9Gv+0wkzHB1RoKf60CcQPd8SoqfjLbkLr4OH9dVY2FOareUUvC+9QHOnr9oIFHjUhO2L1uCI3ECu6vyCEhsNkp5xvEYSkueyNiKE7392Hug1dwSoLWrOeikxCgq3UxTw3fXvIzCu60ZCS6P/o3tFe+mimGSmpXsbm8NQLXGiKV5udi725fWntnx2yveweXRK2YSwutk9/i6wdhgRB9Ztxrel1xXNan1+5rQ1z9giiXgONnLKy9CiJuN6LU52dgfenPeG/wzNo4XvLWYmJw2i1G4QE+V+6akQFYqqQ/db4N/53MZb9HU0oH2r3pTxiioqYwEREDjngBuunFpygITE5PYUbEL46nUA0gQuH2/S+CWdDJtdy1Dbc1OkM5mOB81RtDTdzr9DXWL0jU5mcVKYat9Pcq3bJpTqOvoCRyMRCGkJT0B8zGyu3xvgPBeJqOrX3HjwbX3zgn55uQpBD9pyTxlTAHa5PbfIcC/plo0/fnjdGzE5mLTFMcLt0WPo7WjG5qmmTdZKZXFwho31uH2tzF4i/5bSoFVK+7E2vtsWFe0CktyF827ySe/G0D/90P4cWgY+vNJP0w41BkOliUItr2Wz9NiEIJy8pYswtv+HVh++61XtWTJoDMjF7Brz0H8dWUMChgTFi6Mfho6PzMaDo/XxUzNegIhBqd9I+xPbsCCBdkZiSYm/0N71zEciXaDRWKdGFTa2dxwOFFr1in2+KuIuV7/S2kxZGcRHn5gDYrWrIQ1fxny8hZDCIFLl0Yx/Ns59J8aQO+3pzEV45lpYmJfZzgUSpY1DXexy1dOpO0H5MK4GqVB02JQSgMUJyQRQQgLpLSAhIjX0nRbQM8nlacl0IGSMt/yaYk6AWyd76WvlFIkRSvDEugK150z+pnxiyHefCWdxHiUFQqVUDfoBYQSf4B4EBA9UvFh/c2VrlH/A6ZBZa5n7W6uAAAAAElFTkSuQmCC">

                        <%
                            if(subjectId != null){
                        %>
                        <%=subjectId %>
                        <%
                        } else if (claimedId != null) {
                        %>
                        <%=claimedId%>
                        <%
                            }
                        %><span class="caret"></span></a>
                    <ul class="dropdown-menu">
                        <li><a href="logout?SAML2.HTTPBinding=HTTP-POST">Logout</a></li>
                    </ul>


                </li>
            </ul>
        </div>
    </div>
</section>


<!-- home section -->
<section id="home" class="parallax-section">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-sm-12">
                <h1>CafeLebens RESTAURANT</h1>
                <h2>Reserve your table TODAY</h2>
                <a href="#gallery" class="smoothScroll btn btn-default">LEARN MORE</a>
            </div>
        </div>
    </div>
</section>


<!-- gallery section -->
<section id="gallery" class="parallax-section">
    <div class="container">
        <div class="row">
            <div class="col-md-offset-2 col-md-8 col-sm-12 text-center">
                <h1 class="heading">Food Gallery</h1>
                <hr>
            </div>
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.3s">
                <a href="images/gallery-img1.jpg" data-lightbox-gallery="zenda-gallery"><img src="images/gallery-img1.jpg" alt="gallery img"></a>
                <div>
                    <h3>Lemon-Rosemary Prawn</h3>
                    <span>Seafood / Shrimp / Lemon</span>
                </div>
                <a href="images/gallery-img2.jpg" data-lightbox-gallery="zenda-gallery"><img src="images/gallery-img2.jpg" alt="gallery img"></a>
                <div>
                    <h3>Lemon-Rosemary Vegetables</h3>
                    <span>Tomato / Rosemary / Lemon</span>
                </div>
            </div>
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.6s">
                <a href="images/gallery-img3.jpg" data-lightbox-gallery="zenda-gallery"><img src="images/gallery-img3.jpg" alt="gallery img"></a>
                <div>
                    <h3>Lemon-Rosemary Bakery</h3>
                    <span>Bread / Rosemary / Orange</span>
                </div>
            </div>
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.9s">
                <a href="images/gallery-img4.jpg" data-lightbox-gallery="zenda-gallery"><img src="images/gallery-img4.jpg" alt="gallery img"></a>
                <div>
                    <h3>Lemon-Rosemary Salad</h3>
                    <span>Chicken / Rosemary / Green</span>
                </div>
                <a href="images/gallery-img5.jpg" data-lightbox-gallery="zenda-gallery"><img src="images/gallery-img5.jpg" alt="gallery img"></a>
                <div>
                    <h3>Lemon-Rosemary Pizza</h3>
                    <span>Pasta / Rosemary / Green</span>
                </div>
            </div>
        </div>
    </div>
</section>


<!-- menu section -->
<section id="menu" class="parallax-section">
    <div class="container">
        <div class="row">
            <div class="col-md-offset-2 col-md-8 col-sm-12 text-center">
                <h1 class="heading">Special Menu</h1>
                <hr>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Vegetable ................ <span>$20.50</span></h4>
                <h5>Chicken / Rosemary / Lemon</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Meat ........................... <span>$30.50</span></h4>
                <h5>Meat / Rosemary / Lemon</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Pork ........................ <span>$40.75</span></h4>
                <h5>Pork / Tooplate / Lemon</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Orange-Rosemary Salad .......................... <span>$55.00</span></h4>
                <h5>Salad / Rosemary / Orange</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Squid ...................... <span>$65.00</span></h4>
                <h5>Squid / Rosemary / Lemon</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Orange-Rosemary Shrimp ........................ <span>$70.50</span></h4>
                <h5>Shrimp / Rosemary / Orange</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Prawn ................... <span>$110.75</span></h4>
                <h5>Chicken / Rosemary / Lemon</h5>
            </div>
            <div class="col-md-6 col-sm-6">
                <h4>Lemon-Rosemary Seafood ..................... <span>$220.50</span></h4>
                <h5>Seafood / Rosemary / Lemon</h5>
            </div>
        </div>
    </div>
</section>

<!-- contact section -->
<section id="contact" class="parallax-section">
    <div class="container">
        <div class="row">
            <div class="col-md-offset-1 col-md-10 col-sm-12 text-center">
                <h1 class="heading">Reserve your table</h1>
                <hr>
            </div>
            <div class="col-md-offset-1 col-md-10 col-sm-12 wow fadeIn" data-wow-delay="0.9s">
                <form action="#" method="post">
                    <div class="col-md-6 col-sm-6">
                        <input name="name" type="text" class="form-control" id="name" placeholder="Name">
                    </div>
                    <div class="col-md-6 col-sm-6">
                        <input name="email" type="email" class="form-control" id="email" placeholder="Email">
                    </div>
                    <div class="col-md-12 col-sm-12">
                        <textarea name="message" rows="8" class="form-control" id="message" placeholder="Message"></textarea>
                    </div>
                    <div class="col-md-offset-3 col-md-6 col-sm-offset-3 col-sm-6">
                        <input name="submit" type="submit" class="form-control" id="submit" value="make a reservation">
                    </div>
                </form>
            </div>
            <div class="col-md-2 col-sm-1"></div>
        </div>
    </div>
</section>


<!-- footer section -->
<footer class="parallax-section">
    <div class="container">
        <div class="row">
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.6s">
                <h2 class="heading">Contact Info.</h2>
                <div class="ph">
                    <p><i class="fa fa-phone"></i> Phone</p>
                    <h4>090-080-0760</h4>
                </div>
                <div class="address">
                    <p><i class="fa fa-map-marker"></i> Our Location</p>
                    <h4>120 Duis aute irure, California, USA</h4>
                </div>
            </div>
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.6s">
                <h2 class="heading">Open Hours</h2>
                <p>Sunday <span>10:30 AM - 10:00 PM</span></p>
                <p>Mon-Fri <span>9:00 AM - 8:00 PM</span></p>
                <p>Saturday <span>11:30 AM - 10:00 PM</span></p>
            </div>
            <div class="col-md-4 col-sm-4 wow fadeInUp" data-wow-delay="0.6s">
                <h2 class="heading">Follow Us</h2>
                <ul class="social-icon">
                    <li><a href="#" class="fa fa-facebook wow bounceIn" data-wow-delay="0.3s"></a></li>
                    <li><a href="#" class="fa fa-twitter wow bounceIn" data-wow-delay="0.6s"></a></li>
                    <li><a href="#" class="fa fa-behance wow bounceIn" data-wow-delay="0.9s"></a></li>
                    <li><a href="#" class="fa fa-dribbble wow bounceIn" data-wow-delay="0.9s"></a></li>
                    <li><a href="#" class="fa fa-github wow bounceIn" data-wow-delay="0.9s"></a></li>
                </ul>
            </div>
        </div>
    </div>
</footer>


<!-- copyright section -->
<section id="copyright">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-sm-12">
                <h3>CafeLebens</h3>
                <p>Powered by WSO2 Identity Server
            </div>
        </div>
    </div>
</section>

<!-- JAVASCRIPT JS FILES -->
<script src="js/jquery.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/jquery.parallax.js"></script>
<script src="js/smoothscroll.js"></script>
<script src="js/nivo-lightbox.min.js"></script>
<script src="js/wow.min.js"></script>
<script src="js/custom.js"></script>

</body>
</html>