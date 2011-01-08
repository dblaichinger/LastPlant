class SessionsController < ApplicationController
  
  before_filter :authenticate, :only => [:destroy]
  
  def new
  	@title = "Sign in"

    if(current_user)
        redirect_to current_user
    end
    
    # create oauth helper
        establish_oauth
		if(!@oath)
            @oauth = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/")
		end

        
        
		#if facebook authorization code exists, get access token
		if params[:code]
			@code = params[:code]
			#request and parse token from facebook
			@token = Koala::Facebook::OAuth.new("115861615151381", '35aba13c7b790d4e41f38feccacbe04a', "http://blaichinger2.heroku.com/").get_access_token(@code)
			
			#establish graph API connection
			establish_graph
			
			#query user data from fb
			@me = @graph.get_object("me")
			
            # if user already member, set session
			if User.find_by_fbid(@me['id'])
                session[:fb_id] = @me['id']
				#flash.now[:notice] = "user logged in."
                
            #else create new user
			else
				@user = User.new(:fbid => @me['id'], :name => @me['name'], :email => @me['email'], :isFacebook => true, :password =>@me['id'], :password_confirmation =>@me['id'])
                
                #if creating user worked, set session
				if @user.save
                    session[:fb_id] = @user.fb_id
					#flash[:success] = "Welcome to Last Plant!"
                    
                #unexpected error occured, save faile 
				else
					flash[:error] = "Login failed."
				end
			end
		end
        #if new fb user is signed in now, redirect to start page
		if(session[:fb_id])
            flash[:success] = "Welcome to Last Plant!"
			session[:id] = User.find_by_fbid(@me['id']).id
            current_user = User.find(session[:id])
			redirect_to current_user
			return
		end

end
 
 
 
  def create
	  user = User.authenticate(params[:session][:email], params[:session][:password])
	  
	  if user.nil?
		flash[:error] = "Invalid email/password combination."
		@title = "Sign in"
		redirect_to root_path
	  else
		 sign_in user
      	 redirect_to user
	  end

  end
  
  
  def destroy
    sign_out
    redirect_to root_path
  end


end
