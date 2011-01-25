module SessionsHelper

  def sign_in(user)
    cookies.permanent.signed[:remember_token] = [user.id, user.salt]
    current_user = user
    session[:id] = user.id
  end

  def current_user=(user)
    @current_user = user
    session[:id] = @current_user.id
  end

  def current_user
    if(session[:fb_id])
      @current_user = User.find_by_fbid(session[:fb_id])
    else
      @current_user ||= user_from_remember_token
    end
  end

  def signed_in?
    !current_user.nil?
  end

  def sign_out
    session[:id] = nil 
    session[:fb_id] = nil
    cookies.delete(:remember_token)
    current_user = nil
  end

  def current_user?(user)
    user == current_user
  end

  # Deny access to page if user is not logged in
  def deny_access
    flash[:notice] = "Please sign in to access this page."
    redirect_to root_path
  end

  def authenticate
    deny_access unless signed_in?
  end

  def correct_user
    @user = User.find(params[:id])
    redirect_to(root_path) unless current_user?(@user)
  end
	
	def admin_user
		if (current_user)
      redirect_to(current_user) unless current_user.admin?
		else
      redirect_to(root_path)
		end
  end

  def user_from_remember_token
    user_with_cookie = User.authenticate_with_salt(*remember_token)
  end

  def remember_token
    cookies.signed[:remember_token] || [nil, nil]
  end


  ## Methods for Facebook - Login
	def establish_graph
		if(!$oauth)
		  establish_oauth
		end
		#request and parse token from facebook
		$token = Koala::Facebook::OAuth.new("158315630884949", '24649532594ab931351f13465261391e', "http://blaichinger5.heroku.com/").get_access_token(@code)
		$graph = Koala::Facebook::GraphtAPI.new($token)
	end
	
	def establish_oauth
	  $oauth = Koala::Facebook::OAuth.new("158315630884949", '24649532594ab931351f13465261391e', "http://blaichinger5.heroku.com/")
	end
	
	
	def facebook_login
    # create oauth helper
    establish_oauth

		#if facebook authorization code exists, get access token
		if params[:code]
			@code = params[:code]
			#establish graph API connection
			establish_graph
			
			#query user data from fb
			@me = $graph.get_object("me")
			
      # if user already member, set session
			if User.find_by_fbid(@me['id'])
        session[:fb_id] = @me['id']
				#flash.now[:notice] = "user logged in."
                
        #else create new user
			else
                params[:user][:fbid] = @me['id']
                params[:user][:name] = @me['name']
                params[:user][:email] = @me['email']
                params[:user][:password] = @me['id']
                params[:user][:password_confirmation] = @me['id']
                
				@user = User.register_new(params[:user], true)
                
        #if creating user worked, set session
				if @user.save
          			session[:fb_id] = @user.fbid
          			flash[:success] = "Welcome to Last Plant!"
					
          #unexpected error occured, save failed
				else
					flash[:error] = "Login failed."
				end
			end
		end
    #if new fb user is signed in now, redirect to start page
		if(session[:fb_id])
			#session[:id] = User.find_by_fbid(session[:fb_id]).id
      current_user = User.find_by_fbid(session[:fb_id])
      session[:id] = current_user.id
			redirect_to current_user
			return
		end
	end
end
