import datetime
from django.contrib.auth.decorators import login_required
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from models import BlogData, UserDetail, User
import json
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.db import transaction
import os
path_blog = settings.BLOG_CONTENTS
@login_required()
def HomePage(request):
    blog_data = []
    posts = BlogData.objects.all()
    for post in posts:
        temp_data = {}
        temp_data.update(
                name=post.blogger.user.username,
                time=post.created_date,
                title=post.title,
                description=post.description,
                comment_count=str(post.blogger.post_count) + ' comment',
                cover_image_url=post.image_url,
                content_url=post.content_url)
        blog_data.append(temp_data)
    return render_to_response('blog_data.html', {'blog_data': blog_data})


@csrf_exempt
def Register(request):
    if request.method == 'POST':
        Username = request.POST['Username']
        Password = request.POST['Password']
        Email = request.POST['Email']
        Name = request.POST['Name']
        try:
            User.objects.get(Username=Username)
        except:
            user = User.objects.create_user(
                    username=Username,
                    password=Password,
                    email=Email,
                    first_name=Name,
            )
            userdetail = UserDetail()
            userdetail.user = user
            userdetail.save()
            message = "success"
    else:
        message = "error"
    return HttpResponse(json.dumps(dict(resultmessage=message)), content_type='application/javascript')


@csrf_exempt
def check_avail(request):
    response_dict = {}
    if request.method == 'POST':
        try:
            User.objects.get(username__iexact=request.POST['username'])
            response_dict.update({'get_avail': "error"})
        except User.DoesNotExist:
            response_dict.update({'get_avail': "success"})
    return HttpResponse(json.dumps(response_dict), content_type='application/javascript')


@csrf_exempt
def registerpage(request):
    return render_to_response('register.html', {})


@csrf_exempt
def redirectTohome(request):
    return HttpResponseRedirect('/home')

@csrf_exempt
def redirectTologin(request):
    return HttpResponseRedirect('/admin')


@csrf_exempt
def login_auth(request):
    user = authenticate(username=request.POST['uname'], password=request.POST['pwd'])
    if user is not None:
        login(request, user)
        return HttpResponseRedirect('/home')
    else:
        return HttpResponseRedirect('/home')



@csrf_exempt
def logout_auth(requset):
    logout(requset)
    return HttpResponseRedirect('/home')

@csrf_exempt
def mysore(request):
    return render_to_response('blog_pages/vaibhav/mysore.html', {})

@login_required()
def addblog(request):
    return render_to_response('addblog.html', {})


@login_required()
@csrf_exempt
@transaction.atomic
def saveblog(request):
    if request.user.is_authenticated():
        auth_point = transaction.savepoint()
        title = request.POST['blog-title']
        description = request.POST['blog-description']
        content = str(request.POST['blog-full-data'])
        try:
            image = request.FILES['blog-image']
        except:
            image = None

        logged_user = request.user
        logged_user_name = logged_user.username
        blogger = UserDetail.objects.get(user=logged_user)
        post_number = blogger.post_count + 1
        today = (datetime.datetime.now()).strftime('%d-%m-%Y')
        extention_content = '.html'
        file_name = str(title) + '_' + today + extention_content
        path_to_dir = str(logged_user_name) + '/' + str(post_number)
        path_to_post_number = "blog_pages/" + path_to_dir
        path_to_user_blog = path_to_post_number + '/' + str(file_name)
        if not os.path.exists(path_to_post_number):
            os.makedirs(path_to_post_number)
        abs_path = os.path.join(os.path.dirname('__file__'), path_to_user_blog).replace("\\", '/')
        with open(abs_path, 'w') as destination:
            destination.write(content)
        destination.close()
        try:
            path_to_user_blog_image = path_to_post_number + '/' + str(image.name)
            abs_path = os.path.join(os.path.dirname('__file__'), path_to_user_blog_image).replace("\\", '/')
            with open(abs_path, 'wb') as destination:
                destination.write(image.read())
            destination.close()
        except:
            path_to_user_blog_image = None
        blogger.post_count = post_number
        blogger.save()
        this_post = BlogData()
        this_post.blogger = blogger
        this_post.title = title
        this_post.description = description
        this_post.content_url = path_to_user_blog
        this_post.image_url = path_to_user_blog_image
        this_post.save()
    else:
        transaction.savepoint_rollback(auth_point)
    return HttpResponseRedirect('/home')

