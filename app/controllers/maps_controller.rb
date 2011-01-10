class MapsController < ApplicationController

  protect_from_forgery :except => [:create, :gamehandler]

  before_filter :authenticate, :only => [:new, :create, :show, :destroy, :gamehandler, :protect_index, :destroy_index]

  def new
  	@title = "Protect"
  end

  def create
  #this method is only called per AJAX request
    if(!params[:mapname] || params[:mapname] == "" || params[:mapname] == "Please enter map name")
      mapname = User.find_by_id(session[:id]).name + "'s " + (Map.find_all_by_user_id(session[:id]).count + 1).to_s + ". Map"     
    else
      mapname = params[:mapname]
    end
    @map = Map.new(:name => mapname, :user_id => session[:id], :content => params[:map], :score => params[:score])
    
    if @map.save
        @user = User.find(@map.user_id)
        @user.createScore += @map.score.to_i
        if @user.save
            flash[:success] = "Your map was created successfully"
        end
    else
        flash[:success] = "Failed to save map "
    end
    render 'protect_index'
  end

  def show
  	@map = Map.find(params[:id])
  	@title = "Destroy"
  end

  def destroy
    #@user = User.find(session[:id])
    @map = Map.find(params[:id])
    @user = User.find(@map.user_id)
    @user.createScore -= @map.score

    if @map.destroy
      @user.save
      flash[:success] = "Your map was destroyed"
    end
    redirect_to protect_path
  end

  def gamehandler
  	@map = Map.find(params[:mapid].to_i)
	@destroyer = User.find(session[:id])
	@builder = User.find(@map.user_id)
    
    if(@destroyer.id != @builder.id)
      @destroyer.destroyScore += params[:destroyerscore].to_i    
      @builder.createScore += params[:builderscore].to_i
    end
    if (@builder.save && @destroyer.save)
        flash[:success] = "Destroyer points added"
    end
    
  end

  def protect_index
  	@title = "Protect"
    @maps = Map.find_all_by_user_id(session[:id])
  end
  
  def destroy_index
  	@title = "Destroy"
    @rand_maps = Map.find(:all, :offset => (Map.count * rand).to_i, :limit => 5)
	
	@user_id = current_user.id
	@my_maps = Map.find_all_by_user_id(@user_id);
  end
end

